import './style.css'
import { Client, Databases, ID } from 'appwrite';

const client = new Client();
const DATABASE_ID = '65fab37f197029cc6565'
const COLLECTION_ID_TASKS = '65fab3f2d2ad2c995845'

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('65faafb9161633f8e46b');

const db = new Databases(client)

const taskList = document.getElementById('tasks-list')
const form = document.getElementById('form')

const themeBtn = document.getElementById('theme-toggler')
const body = document.querySelector('body')

window.addEventListener('load', () =>{
  const theme = localStorage.getItem('theme')
  const cBox = localStorage.getItem("cBox")
  themeBtn.checked = cBox === 'true';
  body.style.backgroundColor = `${theme}`
})


themeBtn.addEventListener('change', (e) => {
  if(e.target.checked){
    body.style.backgroundColor = '#31363F'
    localStorage.setItem('theme', '#31363F')
    localStorage.setItem('cBox', true)
  } else{
    body.style.backgroundColor = 'white'
    localStorage.setItem('theme', 'white')
    localStorage.setItem('cBox', false)
  }
} )

form.addEventListener('submit', addTask)

async function getTasks(){
  const response = await db.listDocuments(
    DATABASE_ID,
    COLLECTION_ID_TASKS
    )
    // console.log(response);
    response.documents.forEach(element => {
      renderToDom(element)
    });
} 

getTasks()

async function renderToDom(task){
  const taskWrapper = `<div class='task-wrapper' id='task-${task.$id}'>
                         <p class='complete-${task.completed}' id="task-body-${task.$id}">${task.body}</p> 
                         <div class="group-buttons">
                         <span id="edit-${task.$id}">Edit</span>
                         <strong class='delete' id='delete-${task.$id}'>x</strong>
                         </div>
                      </div>`

  taskList.insertAdjacentHTML('afterbegin', taskWrapper)

  console.log(taskWrapper);
  const deleteBtn = document.getElementById(`delete-${task.$id}`)
  const wrapper = document.getElementById(`task-${task.$id}`)
  
  const editableText = document.getElementById(`task-body-${task.$id}`) 
  const editBtn = document.getElementById(`edit-${task.$id}`)

  editBtn.addEventListener('click', ()=>{
    const inputField = document.createElement('input')
    inputField.value = editableText.textContent

    editableText.replaceWith(inputField)
    inputField.focus()
    inputField.classList.add("editable-input")
    // console.log(inputField);

    editBtn.textContent = "Save"

    const saveChanges = async () => {
      editBtn.textContent = "Edit"
      
      const updatedResponse = await db.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_TASKS,
        task.$id,
        {'body': inputField.value}
      );

      const newParagraph = document.createElement('p');
      newParagraph.setAttribute("id", `task-body-${task.$id}`)
      newParagraph.classList.add(`complete-${task.completed}`)
      newParagraph.textContent = updatedResponse.body
      
      inputField.replaceWith(newParagraph);
      console.log(newParagraph);

      editBtn.removeEventListener('click', saveChanges);

      editBtn.addEventListener('click', editButtonClick);
      location.reload()
    };

    const editButtonClick = () => {
      saveChanges();
    };

    editBtn.addEventListener('click', editButtonClick)
    inputField.addEventListener('blur', saveChanges);
    inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveChanges();
      }
    });
  })

  deleteBtn.addEventListener('click', () => {
    db.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID_TASKS,
      task.$id
    )

    wrapper.remove()
  })

  wrapper.childNodes[1].addEventListener('click', async (e) => {
    console.log("running...");
    task.completed = !task.completed
    e.target.className = `complete-${task.completed}`

    await db.updateDocument(
      DATABASE_ID,
      COLLECTION_ID_TASKS,
      task.$id,
      {'completed': task.completed}
    )
  })

  // wrapper.addEventListener('click', async (e) => {
  //   if (e.target.classList.contains('task-wrapper')) {
  //     task.completed = !task.completed;
  //     editableText.classList.toggle(`complete-${task.completed}`);
      
  //     await db.updateDocument(
  //       DATABASE_ID,
  //       COLLECTION_ID_TASKS,
  //       task.$id,
  //       {'completed': task.completed}
  //     );
  //   }
  // });
}


async function addTask(e){
  e.preventDefault()

  const taskBody = e.target.body.value

  if(taskBody === ''){
    alert("Please add tasks!")
    return
  }

  const response = await db.createDocument(
    DATABASE_ID,
    COLLECTION_ID_TASKS,
    ID.unique(),
    {'body': taskBody}
  )
  renderToDom(response)
  form.reset()
  console.log(response);

}




