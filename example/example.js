import MultiSelect from '../src/MultiSelect.vue';

new Vue({
    el: '#root-container',

    components: {
        'multi-select': MultiSelect
    },

    data: {
        selectedOptions: null,
        options: [
            {id: 1, name: "Авто"},
            {id: 195, name: "Бытовая техника"},
            {id: 292, name: "Все для офиса"},
            {id: 331, name: "Детские товары"},
            {id: 589, name: "Дом и дача"},
            {id: 1174, name: "Досуг и развлечения"},
            {id: 1426, name: "Компьютерная техника"},
            {id: 1523, name: "Красота и здоровье"},
            {id: 1654, name: "Оборудование"},
            {id: 1736, name: "Одежда, обувь и аксессуары"},
            {id: 1998, name: "Подарки и цветы"},
            {id: 2065, name: "Продукты"},
            {id: 2162, name: "Спорт и отдых"},
            {id: 2327, name: "Товары для животных"},
            {id: 2359, name: "Услуги"},
            {id: 2383, name: "Электроника"}
        ],
        optionsUrl: "http://insbor.ru/vue/multi-select/product-categories.php?search="
    }
});