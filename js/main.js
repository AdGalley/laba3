Vue.component('task-card', {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="task-card">
      <h3>{{ task.title }}</h3>
      <p class="description">{{ task.description }}</p>
      <p class="date">Создано: {{ task.createdAt }}</p>
      <p class="deadline">Дедлайн: {{ task.deadline }}</p>
    </div>
  `
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
      <create-task-form 
        v-if="columnIndex === 0"
        @task-created="$emit('task-created', $event)">
      </create-task-form>
      <div class="tasks-list">
        <task-card 
          v-for="task in tasks" 
          :key="task.id" 
          :task="task">
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
  methods: {
    handleTaskCreated(newTask) {
      newTask.id = this.nextTaskId++;
      this.columns[0].push(newTask);
    }
  }
});

Vue.component('create-task-form', {
  data() {
    return {
      title: '',
      description: '',
      deadline: ''
    }
  },
  template: `
    <div class="create-form">
      <h3>Новая задача</h3>
      <input 
        v-model="title" 
        placeholder="Заголовок" 
        class="input-field"
      >
      <textarea 
        v-model="description" 
        placeholder="Описание" 
        class="input-field"
      ></textarea>
      <input 
        v-model="deadline" 
        type="date" 
        class="input-field"
      >
      <button @click="createTask" class="btn-create">
        Создать
      </button>
    </div>
  `,
  methods: {
    createTask() {
      if (this.title && this.description && this.deadline) {
        const newTask = {
          title: this.title,
          description: this.description,
          deadline: this.deadline,
          createdAt: this.getCurrentDateTime()
        };
        this.$emit('task-created', newTask);
        this.title = '';
        this.description = '';
        this.deadline = '';
      } else {
        alert('Заполните все поля!');
      }
    },
    getCurrentDateTime() {
      const now = new Date();
      return now.toLocaleString('ru-RU');
    }
  }
});