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
      editDeadline: ''
    }
  },
  template: `
    <div class="task-card">
      <div v-if="!isEditing">
        <h3>{{ task.title }}</h3>
        <p class="description">{{ task.description }}</p>
        <p class="date">Создано: {{ task.createdAt }}</p>
        <p class="deadline">Дедлайн: {{ task.deadline }}</p>
        <p v-if="task.updatedAt" class="updated">
          Изменено: {{ task.updatedAt }}
        </p>
        <div class="card-actions">
          <button @click="startEdit" class="btn-edit">
            Редактировать
          </button>
          <button 
            v-if="columnIndex < 3" 
            @click="$emit('move-task', task.id, columnIndex)" 
            class="btn-move">
            {{ getMoveButtonText() }}
          </button>
        </div>
      </div>
      <div v-else class="edit-form">
        <input v-model="editTitle" placeholder="Заголовок">
        <textarea v-model="editDescription" placeholder="Описание"></textarea>
        <input v-model="editDeadline" type="date">
        <button @click="saveEdit" class="btn-save">Сохранить</button>
        <button @click="cancelEdit" class="btn-cancel">Отмена</button>
      </div>
    </div>
  `,
  methods: {
    getMoveButtonText() {
      const texts = ['В работу', 'На тестирование', 'Выполнить'];
      return texts[this.columnIndex];
    },
    startEdit() {
      this.editTitle = this.task.title;
      this.editDescription = this.task.description;
      this.editDeadline = this.task.deadline;
      this.isEditing = true;
    },
    saveEdit() {
      this.$emit('update-task', this.task.id, {
        title: this.editTitle,
        description: this.editDescription,
        deadline: this.editDeadline,
        updatedAt: this.getCurrentDateTime()
      });
      this.isEditing = false;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    getCurrentDateTime() {
      const now = new Date();
      return now.toLocaleString('ru-RU');
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
      <create-task-form 
        v-if="columnIndex === 0"
        @task-created="$emit('task-created', $event)">
      </create-task-form>
      <div class="tasks-list">
        <task-card 
          v-for="task in tasks" 
          :key="task.id" 
          :task="task"
          :column-index="columnIndex"
          @move-task="$emit('move-task', $event, columnIndex)"
          @update-task="$emit('update-task', $event, columnIndex, $event)">
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
    },
    handleMoveTask(taskId, fromColumn) {
      const taskIndex = this.columns[fromColumn].findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = this.columns[fromColumn][taskIndex];
      this.columns[fromColumn].splice(taskIndex, 1);
      this.columns[fromColumn + 1].push(task);
    },
    handleUpdateTask(taskId, fromColumn, updates) {
      const task = this.columns[fromColumn].find(t => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
      }
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