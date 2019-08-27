<template>
  <div class="hello">
      <input type="text" v-model="name" placeholder="Имя">
      <input type="number" v-model="age" placeholder="Возраст">
      <button @click="createUser()">Создать</button>
      <ul v-for="user in users">
        <li>name: {{ user.name }} age: {{user.age}}</li>
      </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data(){
    return {
        users: [],
        name: '',
        age: null,
    }
  },
  methods: {
    getData(){
      const url = 'https://sky-tanuki.herokuapp.com' + '/users'
      axios.get(url)
        .then(response => {
          this.users = response.data
          console.log(this.users)
        });
    },
    createUser(){
        const data = {
            name: this.name,
            age: this.age,
        }
     const url = 'https://sky-tanuki.herokuapp.com' + '/users'
      // const url = 'http://localhost:3000/users'
      axios.post(url, data )
        .then((response) => {
          console.log(response);
          this.getData()
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  mounted(){
    this.getData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
