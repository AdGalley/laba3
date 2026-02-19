// Компонент карточки задачи
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

// Компонент столбца
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

// Корневой экземпляр Vue
let app = new Vue({
  el: '#app',
  data: {
    columns: [
      [], // Запланированные
      [], // В работе
      [], // Тестирование
      []  // Выполненные
    ]
  }
});