/* global angular */
/* global PouchDB */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  .factory('Todos', function () {
    var db = new PouchDB('todos', {auto_compaction: true});

    db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function (change) {
      console.log('Changes', change);
    });

    db.replicate.to('http://localhost:3000/todos', {
      live: true,
      retry: true,
      back_off_function: function (delay) {
        if (delay === 0) {
          return 1000;
        }
        return delay * 3;
      }
    });

    return db;
  })
  .controller('TodoCtrl', function ($scope, Todos) {

    obterTodosAtualizados();

    $scope.todo = '';

    $scope.adicionarTodo = function () {
      var todo = {todo: $scope.todo};
      $scope.todo = '';
      return Todos.post(todo).then(obterTodosAtualizados);
    }

    $scope.removerTodo = function (doc) {
      return Todos.remove(doc).then(obterTodosAtualizados);
    }
    
    function obterTodosAtualizados() {
      return Todos.allDocs({ include_docs: true }).then(function (todos) {
        $scope.$applyAsync(function () {
          console.log(todos);
          $scope.todos = todos.rows.map(function (linha) {
            return linha.doc;
          });
        });
      });
    }
  });
