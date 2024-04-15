import './style.css'
import { Client, Databases, ID } from 'appwrite';
import conf from './conf';

const client = new Client();


client
    .setEndpoint(conf.url)
    .setProject(conf.projectId);

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
    conf.dbId,
    conf.collectionId
    )
    response.documents.forEach(element => {
      renderToDom(element)
    });
} 

getTasks()

async function renderToDom(task){
  const taskWrapper = `<div class='task-wrapper' id='task-${task.$id}'>
                         <input
                         value='${task.body}' 
                         class='complete-${task.completed}' id="task-body-${task.$id}"
                         readonly
                         >
                         <div class="group-buttons">
                         <button id="edit-${task.$id}">Edit</button>
                         <strong class='delete' id='delete-${task.$id}'>x</strong>
                         </div>
                      </div>`

  taskList.insertAdjacentHTML('afterbegin', taskWrapper)

  const deleteBtn = document.getElementById(`delete-${task.$id}`)
  const wrapper = document.getElementById(`task-${task.$id}`)
  

  const editBtn = document.getElementById(`edit-${task.$id}`)
  const editableTask = document.getElementById(`task-body-${task.$id}`)


  function handleEditButtonClick() {

    
    if (editBtn.textContent === 'Edit') {
      editableTask.removeAttribute('readonly');
      editBtn.textContent = 'Save';
    } else {
      if (editableTask.value === '') {
        return alert('Please add some value!')
      }
      db.updateDocument(
        conf.dbId,
        conf.collectionId,
        task.$id,
        {'body': editableTask.value}
      )
      editableTask.setAttribute('readonly', 'readonly');
      editBtn.textContent = 'Edit';
    }
    
  }
 

  


  deleteBtn.addEventListener('click', () => {
    db.deleteDocument(
      conf.dbId,
      conf.collectionId,
      task.$id
    )

    wrapper.remove()
  })

  
  wrapper.childNodes[1].addEventListener('click', async (e) => {
    if (editBtn.textContent === 'Edit') {
      
      task.completed = !task.completed
      e.target.className = `complete-${task.completed}`
      console.log(task.completed);
      if (task.completed === true) {
        editBtn.disabled = true
      } else{
        editBtn.disabled = false
      }

      await db.updateDocument(
        conf.dbId,
        conf.collectionId,
        task.$id,
        {'completed': task.completed}
      )
  
    }
  })
  if (task.completed === true) {
    editBtn.disabled = true
  } else{
    editBtn.disabled = false
  }
    editBtn.addEventListener('click', handleEditButtonClick)

}


async function addTask(e){
  e.preventDefault()

  const taskBody = e.target.body.value

  if(taskBody === ''){
    alert("Please add tasks!")
    return
  }

  const response = await db.createDocument(
    conf.dbId,
    conf.collectionId,
    ID.unique(),
    {'body': taskBody}
  )
  renderToDom(response)
  form.reset()
  console.log(response);

}




