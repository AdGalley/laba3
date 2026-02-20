let eventBus = new Vue();

Vue.component('create-task-form', {
  data() {
    return {
      title: '',
      description: '',
      deadline: ''
    }
  },
  template: `
    <form class="create-form" @submit.prevent="createTask">
      <h3>Новая задача</h3>
      <p>
        <label for="title">Заголовок:</label>
        <input id="title" v-model="title" placeholder="Заголовок" class="input-field">
      </p>
      <p>
        <label for="description">Описание:</label>
        <textarea id="description" v-model="description" placeholder="Описание" class="input-field"></textarea>
      </p>
      <p>
        <label for="deadline">Дедлайн:</label>
        <input id="deadline" v-model="deadline" type="date" class="input-field">
      </p>
      <p>
        <input type="submit" value="Создать" class="btn-create">
      </p>
      <p v-if="errors.length">
        <b>Исправьте ошибки:</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
    </form>
  `,
  data() {
    return {
      title: '',
      description: '',
      deadline: '',
      errors: []
    }
  },
  methods: {
    createTask() {
      this.errors = [];
      
      if (this.title && this.description && this.deadline) {
        let newTask = {
          title: this.title,
          description: this.description,
          deadline: this.deadline,
          createdAt: new Date().toISOString()
        };
        
        eventBus.$emit('task-created', newTask);
        
        this.title = '';
        this.description = '';
        this.deadline = '';
      } else {
        if (!this.title) this.errors.push("Заголовок обязателен.");
        if (!this.description) this.errors.push("Описание обязательно.");
        if (!this.deadline) this.errors.push("Дедлайн обязателен.");
      }
    }
  }
});

Vue.component('task-card', {
  props: {
    task: {
      type: Object,
      required: true
    },
    columnIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      editTitle: '',
      editDescription: '',
      editDeadline: '',
      showReturnForm: false,
      returnReason: ''
    }
  },
  template: `
    <div class="task-card" :class="getStatusClass()">
      <div v-if="!isEditing && !showReturnForm">
        <h3>{{ task.title }}</h3>
        <p class="description">{{ task.description }}</p>
        <p class="date">Создано: {{ formatDate(task.createdAt) }}</p>
        <p class="deadline">Дедлайн: {{ task.deadline }}</p>
        <p v-if="task.completedAt" class="completed-info">
          Выполнено: {{ formatDate(task.completedAt) }}
          <span :class="deadlineStatusClass()">
            ({{ getDeadlineStatus() }})
          </span>
        </p>
        <p v-if="task.updatedAt" class="updated">
          Изменено: {{ formatDate(task.updatedAt) }}
        </p>
        <p v-if="task.returnReason" class="return-info">
          Возврат: {{ task.returnReason }}
        </p>
        <div class="card-actions">
          <button @click="startEdit" class="btn-edit">Редактировать</button>
          
          <button v-if="columnIndex === 0" @click="moveForward" class="btn-move">В работу</button>
          <button v-if="columnIndex === 1" @click="moveForward" class="btn-move">На тестирование</button>
          <button v-if="columnIndex === 2" @click="moveForward" class="btn-move">Выполнить</button>
          
          <button v-if="columnIndex === 2" @click="showReturnForm = true" class="btn-return">Вернуть</button>
          <button v-if="columnIndex === 0" @click="deleteTask" class="btn-delete">Удалить</button>
        </div>
      </div>
      
      <div v-if="showReturnForm" class="return-form">
        <h4>Причина возврата:</h4>
        <textarea v-model="returnReason" placeholder="Укажите причину..." rows="3"></textarea>
        <button @click="returnToWork" class="btn-confirm">Подтвердить</button>
        <button @click="cancelReturn" class="btn-cancel">Отмена</button>
      </div>
      
      <div v-if="isEditing" class="edit-form">
        <input v-model="editTitle" placeholder="Заголовок">
        <textarea v-model="editDescription" placeholder="Описание"></textarea>
        <input v-model="editDeadline" type="date">
        <button @click="saveEdit" class="btn-save">Сохранить</button>
        <button @click="cancelEdit" class="btn-cancel">Отмена</button>
      </div>
    </div>
  `,
  computed: {
    isOverdue() {
      if (!this.task.completedAt || !this.task.deadline) return false;
      const deadline = new Date(this.task.deadline + 'T23:59:59');
      const completed = new Date(this.task.completedAt);
      if (isNaN(deadline.getTime()) || isNaN(completed.getTime())) return false;
      return completed > deadline;
    }
  },
  methods: {
    formatDate(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    getStatusClass() {
      if (this.columnIndex === 3) {
        return this.isOverdue ? 'overdue' : 'on-time';
      }
      return '';
    },
    deadlineStatusClass() {
      return this.isOverdue ? 'status-overdue' : 'status-ontime';
    },
    getDeadlineStatus() {
      return this.isOverdue ? 'Просрочено' : 'В срок';
    },
    startEdit() {
      this.editTitle = this.task.title;
      this.editDescription = this.task.description;
      this.editDeadline = this.task.deadline;
      this.isEditing = true;
    },
    saveEdit() {
      eventBus.$emit('update-task', this.task.id, {
        title: this.editTitle,
        description: this.editDescription,
        deadline: this.editDeadline,
        updatedAt: new Date().toISOString()
      });
      this.isEditing = false;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    moveForward() {
      eventBus.$emit('move-task', this.task.id, this.columnIndex);
    },
    returnToWork() {
      if (this.returnReason.trim()) {
        eventBus.$emit('return-task', this.task.id, this.returnReason);
        this.returnReason = '';
        this.showReturnForm = false;
      } else {
        alert('Укажите причину возврата!');
      }
    },
    cancelReturn() {
      this.showReturnForm = false;
      this.returnReason = '';
    },
    deleteTask() {
      if (confirm('Удалить эту задачу?')) {
        eventBus.$emit('delete-task', this.task.id);
      }
    }
  }
});

Vue.component('board-column', {
  props: {
    title: {
      type: String,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    columnIndex: {
      type: Number,
      required: true
    }
  },
  template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <create-task-form v-if="columnIndex === 0"></create-task-form>
      <div class="tasks-list">
        <task-card 
          v-for="task in tasks" 
          :key="task.id" 
          :task="task"
          :column-index="columnIndex">
        </task-card>
      </div>
    </div>
  `
});

let app = new Vue({
  el: '#app',
  data: {
    columns: [
      [], // Запланированные
      [], // В работе
      [], // Тестирование
      []  // Выполненные
    ],
    nextTaskId: 1
  },
  template: `
    <div class="app-root">
      <h1>Kanban Board</h1>
      
      <div class="board">
        <board-column 
          :title="'Запланированные задачи'" 
          :tasks="columns[0]" 
          :column-index="0">
        </board-column>

        <board-column 
          :title="'Задачи в работе'" 
          :tasks="columns[1]" 
          :column-index="1">
        </board-column>

        <board-column 
          :title="'Тестирование'" 
          :tasks="columns[2]" 
          :column-index="2">
        </board-column>

        <board-column 
          :title="'Выполненные задачи'" 
          :tasks="columns[3]" 
          :column-index="3">
        </board-column>
      </div>
      
      <button 
        @click="clearCompletedTasks" 
        class="btn-clear-completed"
        :disabled="columns[3].length === 0">
        Очистить выполненные задачи
      </button>
    </div>
  `,
  methods: {
    handleTaskCreated(newTask) {
      newTask.id = this.nextTaskId++;
      this.columns[0].push(newTask);
      this.saveToLocalStorage();
    },
    handleMoveTask(taskId, fromColumn) {
      const taskIndex = this.columns[fromColumn].findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = this.columns[fromColumn][taskIndex];
      this.columns[fromColumn].splice(taskIndex, 1);
      
      if (fromColumn === 2) {
        task.completedAt = new Date().toISOString();
      }
      
      this.columns[fromColumn + 1].push(task);
      this.saveToLocalStorage();
    },
    handleUpdateTask(taskId, updates) {
      for (let i = 0; i < this.columns.length; i++) {
        const task = this.columns[i].find(t => t.id === taskId);
        if (task) {
          Object.assign(task, updates);
          this.saveToLocalStorage();
          break;
        }
      }
    },
    handleReturnTask(taskId, reason) {
      const taskIndex = this.columns[2].findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = this.columns[2][taskIndex];
      task.returnReason = reason;
      task.returnedAt = new Date().toISOString();
      
      this.columns[2].splice(taskIndex, 1);
      this.columns[1].push(task);
      this.saveToLocalStorage();
    },
    handleDeleteTask(taskId) {
      const taskIndex = this.columns[0].findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        this.columns[0].splice(taskIndex, 1);
        this.saveToLocalStorage();
      }
    },
   
    clearCompletedTasks() {
      if (confirm('Очистить все выполненные задачи? Это действие нельзя отменить!')) {
        this.columns[3] = [];
        this.saveToLocalStorage();
      }
    },
    
    saveToLocalStorage() {
      localStorage.setItem('kanban_columns', JSON.stringify(this.columns));
      localStorage.setItem('kanban_nextTaskId', this.nextTaskId);
    },
    
    loadFromLocalStorage() {
      const savedColumns = localStorage.getItem('kanban_columns');
      const savedNextTaskId = localStorage.getItem('kanban_nextTaskId');
      
      if (savedColumns) {
        this.columns = JSON.parse(savedColumns);
      }
      
      if (savedNextTaskId) {
        this.nextTaskId = parseInt(savedNextTaskId);
      }
    }
  },
  
  mounted() {
    this.loadFromLocalStorage();
    
    eventBus.$on('task-created', (newTask) => {
      this.handleTaskCreated(newTask);
    });
    
    eventBus.$on('move-task', (taskId, fromColumn) => {
      this.handleMoveTask(taskId, fromColumn);
    });
    
    eventBus.$on('update-task', (taskId, updates) => {
      this.handleUpdateTask(taskId, updates);
    });
    
    eventBus.$on('return-task', (taskId, reason) => {
      this.handleReturnTask(taskId, reason);
    });
    
    eventBus.$on('delete-task', (taskId) => {
      this.handleDeleteTask(taskId);
    });
  }
});