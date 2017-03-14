# multi-select
Компонент VueJS2 для множественного выбора с автокомплитом и динамической загрузкой опций.
 
Multi select VueJS2 component.

[Пример (Example)](http://insbor.ru/vue/multi-select/ "Component example")

![Пример (example)](https://raw.githubusercontent.com/va-fursenko/multi-select/master/example/multi-select-example.png "Пример (example)")

```html
<multi-select
    placeholder="Выберите категории"
    :options="options"
    v-model="selectedOptions"
    options-url="/some-url/product-categories.php"
>
</multi-select>
```

Изначальный список загруженных опций передаётся из родительского компонента в виде массива объектов вида 
```js
[
    {id:1, name:"Авто"},
    {id:195, name:"Бытовая техника"},
    // . . . //
]
```
Если не указан параметр `options-url`, то выбор будет вестись только среди явно указанных. 
Иначе, при вводе текста на указанный адрес будет отправляться AJAX-запрос с параметром `search`. 
Ответ ожидается в виде упакованного в json объекта вида для `search == 'а'`
 ```js
{
    success: true,
    data: [
        {
            id: 1360,
            name: "Авиация, космонавтика",
            pathName: "Досуг и развлечения/Книги/Техническая литература/Транспорт"
        },
        {
            id: 1,
            name: "Авто",
            pathName: ""
        },
        {
            id: 176,
            name: "Автомобили",
            pathName: "Авто/Транспорт"
        },
        {
            id: 9,
            name: "Автомобильные инструменты",
            pathName: "Авто"
        },
        //. . .// 
    ]
}
```

При открытии и закрытии выпадающего списка опций и при загрузке опций с сервера вызываются следующие события `this.events`:
```js
    {
        DROP_DOWN_SHOW: 'drop-down-show',
        DROP_DOWN_HIDE: 'drop-down-hide',
        OPTIONS_LOADED: 'options-loaded'
    }
```