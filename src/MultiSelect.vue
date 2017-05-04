<template>
    <div class="multi-select__container">

        <div class="multi-select__selected-input" ref="inputContainer">
            <div class="multi-select__selected" @click="setInputFocus()">
                <ul class="multi-select__selected" ref="list" @click="toggleDropDown(true, true)">
                    <li v-for="option in selectedOptions" class="multi-select__selected-option" ref="selectedOptions" :title="option.pathName">
                        <i title="Unselect option" @click.stop="unselectOption(option)">×</i>
                        <span>{{ option.name }}</span>
                    </li>
                    <li class="multi-select__input" ref="textInputContainer">
                        <input
                            type="text"
                            class="multi-select__input"
                            maxlength="64"
                            ref="textInput"
                            :placeholder="hasSelected ? '' : placeholder"
                            :title="title"
                            v-model="caption"
                            @keydown="toggleDropDown(true, true); updateTextInputWidth();"
                            @keydown.enter="trySelectOption()"
                            @keydown.up="hoverNextOption(false)"
                            @keydown.down="hoverNextOption(true)"
                            @keydown.esc="toggleDropDown(false, false)"
                        >
                    </li>
                </ul>
            </div>

            <div
                class="fa multi-select__chevron"
                :class="{
                    'fa-chevron-down': !isDroppedDown,
                      'fa-chevron-up': isDroppedDown
                }"
                :title="(isDroppedDown ? 'Hide' : 'Show') + ' options list'"
                @click="toggleDropDown(!isDroppedDown, false); setInputFocus()"
             >
            </div>
        </div>

        <div
            ref="dropDown"
            class="multi-select__drop-down"
            :class="{'multi-select__has-options': hasDroppedDown}"
            v-show="isDroppedDown"
            @keyup.esc="toggleDropDown(false)"
        >
            <div
                ref="droppedDownOptions"
                v-for="(option, index) in droppedDownOptions"
                :class="{
                    'multi-select__selected': isSelected(option),
                     'multi-select__hovered': dropDownHoveredIndex === index
                }"
                @click="selectOption(option)"
                @mouseover="dropDownHoveredIndex = index"
            >
                <span>{{ option.name }}</span>
                <span class="multi-select">{{ option.pathName }}</span>
            </div>
        </div>

    </div>
</template>

<script lang="babel">
    import { App } from './common/app';
    import { Http } from './common/http';

    Vue.config.keyCodes = {
        char: [
            // space
            32,
            // a-z
            65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
            // A-Z
            97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
            // а-я
            1105, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103,
            // А-Я
            1025, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071,
        ]
    };

    export default {
        name: 'MultiSelect',

        // Obtained parameters
        props: {
            // Options list
            options: {
                type: Array,
                required: true
            },
            // Selected options
            value: {
                type: Array,
                default: [],
                twoWay: true
            },
            // Text input placeholder
            placeholder: {
                type: String,
                default: ''
            },
            // Text input hint message
            title: {
                type: String,
                default: ''
            },
            // Component DOM id
            id: {
                type: String,
                default: ''
            },
            // Ajax options load url
            optionsUrl: {
                type: String,
                default: ''
            }
        },

        // Data store
        data () {
            return {
                // Component HTML options
                caption: '',
                droppedDownOptions: [],

                // Component settings
                dropDownLimit: 0,

                // Inner properties
                isDroppedDown: false,
                dropDownHoveredIndex: null,
                dropDownByCaption: true,
                // Selected options
                selectedOptions: []
            };
        },

        // Computed properties
        computed: {
            /**
             * Possible component's custom events
             *
             * @return {Object}
             */
            events () {
                return {
                    DROP_DOWN_SHOW: 'drop-down-show',
                    DROP_DOWN_HIDE: 'drop-down-hide',
                    OPTIONS_LOADED: 'options-loaded'
                };
            },

            /**
             * Has selected options flag
             *
             * @return {Boolean}
             */
            hasSelected () {
                return Array.isArray(this.selectedOptions) && this.selectedOptions.length > 0;
            },

            /**
             * Has dropped down options flag
             *
             * @return {Boolean}
             */
            hasDroppedDown () {
                return Array.isArray(this.droppedDownOptions) && this.droppedDownOptions.length > 0
            },

            /**
             * Get selected options list
             *
             * @return {Array}
             */
            selectedIds () {
                let result = [];
                for (let option of this.selectedOptions) {
                    result.push(option.id);
                }
                return result;
            }
        },

        // Component's methods
        methods: {
            /**
             * Try to find option in selected options list
             *
             * @param {Object} option
             * @return {Number}
             */
            findSelected (option) {
                for (let pos in this.selectedOptions) {
                    if (this.selectedOptions.hasOwnProperty(pos) && this.selectedOptions[pos].id === option.id) {
                        return Number.parseInt(pos);
                    }
                }
                return -1;
            },

            /**
             * Select one dropped down option, or unselect it, if it's already selected
             *
             * @param {Object} option
             */
            selectOption (option) {
                let position = this.findSelected(option);
                if (position == -1) {
                    this.selectedOptions.push(option);
                    this.selectedOptions = this.selectedOptions.sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    this.selectedOptions.splice(position, 1);
                }
                Vue.nextTick(this.updateTextInputWidth);
                // Dispatch new input event with new value
                this.$emit('input', this.selectedIds);
            },

            /**
             * Select first dropped down option
             */
            trySelectOption () {
                if (!this.hasDroppedDown) {
                    return false;
                }
                if (this.droppedDownOptions.length > 0) {
                    let index = this.dropDownHoveredIndex !== null ? this.dropDownHoveredIndex : 0;
                    this.selectOption(this.droppedDownOptions[index]);
                }
            },

            /**
             * Focus on next one dropped down option
             *
             * @param inc
             */
            hoverNextOption (inc) {
                let index;
                if (this.dropDownHoveredIndex === null) {
                    index = inc ? 0 : this.droppedDownOptions.length - 1;
                } else if (inc && this.dropDownHoveredIndex === this.droppedDownOptions.length - 1) {
                    index = 0;
                } else if (!inc && this.dropDownHoveredIndex === 0) {
                    index = this.droppedDownOptions.length - 1;
                } else {
                    index = this.dropDownHoveredIndex + (inc ? 1 : -1);
                }
                this.dropDownHoveredIndex = index;
                if (index >= 0 && typeof this.$refs.droppedDownOptions[index] != 'undefined') {
                    this.$refs.droppedDownOptions[index].scrollIntoView(false);
                    //this.showSelected(this.droppedDownOptions[index]);
                }
            },

            /**
             * Uselect specified option
             *
             * @param {Object} option
             */
            unselectOption (option) {
                let position = this.findSelected(option);
                if (position != -1) {
                    this.selectedOptions.splice(position, 1);
                    Vue.nextTick(this.updateTextInputWidth);
                    // Dispatch new input event with new value
                    this.$emit('input', this.selectedIds);
                }
            },

            /**
             * Check, whether option is selected
             *
             * @param {Object} option
             */
            isSelected (option) {
                for (let opt of this.selectedOptions) {
                    if (opt.id === option.id) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Toggle drop down container visibility
             *
             * @param {Boolean} dropDown
             * @param {Boolean} byCaption
             */
            toggleDropDown (dropDown, byCaption = true) {
                if (dropDown == this.isDroppedDown) {
                    return;
                }
                // Show drop down list
                if (dropDown) {
                    this.dropDownByCaption = byCaption;
                    this.dropDownHoveredIndex = 0;
                    // Add global document click listener to handle focus lose event
                    document.addEventListener('click', this.documentClickHandler);
                    // Dispatch custom component event
                    this.$emit(this.events.DROP_DOWN_SHOW);
                // Hide drop down list
                } else {
                    // Remove global document click listener
                    document.removeEventListener('click', this.documentClickHandler);
                    this.dropDownHoveredIndex = null;
                    // Dispatch custom component event
                    this.$emit(this.events.DROP_DOWN_HIDE);
                }
                this.isDroppedDown = dropDown;
            },

            /**
             * Set focus to text input
             */
            setInputFocus () {
                this.$refs.textInput.focus();
            },

            /**
             * Update input width with max available
             */
            updateTextInputWidth () {
                let defaultWidth = 50,
                    chevronWidth = 26;
                if (!this.$refs.inputContainer) {
                    return defaultWidth;
                }
                let width,
                    parentRect = this.$refs.inputContainer.getBoundingClientRect();
                if (this.hasSelected && this.$refs.selectedOptions) {
                    let rect = this.$refs.selectedOptions[this.$refs.selectedOptions.length - 1]
                        .getBoundingClientRect();
                    width = parentRect.width + parentRect.left - rect.right - chevronWidth;
                    // If width less, than minimum, or more than maximum value, set it to whole row width
                    if (width < defaultWidth || width > parentRect.width - chevronWidth) {
                        width = parentRect.width - chevronWidth;
                    }
                } else {
                    width = parentRect.width - chevronWidth;
                }
                this.$refs.textInputContainer.style.width = width - 15 + "px";
            },

            /**
             * Document click handler for drop down toggle
             *
             * @param {Object} event
             */
            documentClickHandler (event) {
                // Click coordinates matches drop down list or text input dimensions
                let onElement = App.eventOnElement(event, this.$refs.dropDown)
                    || App.eventOnElement(event, this.$refs.inputContainer);
                // If drop down list shown and any one of conditions successful, hide drop down list
                if (this.isDroppedDown && !onElement) {
                    event.preventDefault();
                    this.toggleDropDown(false);
                }
            },

            /**
             * Window resize handler to text input resize
             *
             * @param {Object} event
             */
            windowResizeHandler (event) {
                this.updateTextInputWidth();
                // I don't know, why input container is less, than drop down container
                this.$refs.dropDown.style.width = this.$refs.inputContainer.getBoundingClientRect().width - 4 + 'px';
            }
        },

        // Caption change watcher
        watch: {
            /**
             * After caption changing droppedDown options should be alike
             * If options ajax load url specified, make request
             *
             * @param value
             */
            caption (value) {
                this.dropDownByCaption = true;
                // Load options by caption
                if (this.optionsUrl) {
                    let self = this;
                    Http.ajaxAction(self.optionsUrl, {search: value.toLowerCase()}, (response) => {
                        self.droppedDownOptions = response.data;
                        self.dropDownHoveredIndex = 0;
                        // Dispatch options load event
                        self.$emit(self.events.OPTIONS_LOADED, response.data);
                    });

                // Filter options by caption
                } else if (value) {
                    value = value.toLowerCase();
                    let droppedDown = [];
                    for (let option of this.options) {
                        if (option.name.substr(0, value.length).toLowerCase() == value) {
                            droppedDown.push(option);
                        }
                    }
                    this.droppedDownOptions = droppedDown;

                // Show all specified options
                } else {
                    this.droppedDownOptions = this.options;
                }
            }
        },

        // Component create handler
        created () {
            this.droppedDownOptions = this.options;
            Vue.nextTick(this.windowResizeHandler);
        },

        // Component mounted handler
        mounted () {
            window.addEventListener('resize', this.windowResizeHandler);
        },

        // Destroy component handler
        beforeDestroy () {
            window.removeEventListener('resize', this.windowResizeHandler);
        }
    }
</script>

<style lang="css">
    /* Component container */
    div.multi-select__container {
        width: 100%;
        position: relative;
    }

    /* Text input container */
    div.multi-select__selected-input {
        width: 100%;
        display: flex;
        align-items: center;
        cursor: text;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
    }

    /* Selected options and text input container */
    div.multi-select__selected {
        max-width: 100%;
        align-self: flex-start;
        flex-grow: 1;
    }

    /* Drop down chevron */
    div.multi-select__chevron {
        cursor: pointer;
        padding: 4px 6px;
    }

    ul.multi-select__selected {
        width: 100%;
        overflow: hidden;
        padding: 0 0 2px 4px;
        margin: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    ul.multi-select__selected > li {
        float: left;
        list-style: none;
        margin: 4px 4px 0 0;
        cursor: default;
    }

    /* Text input container */
    li.multi-select__input {
        flex-grow: 1;
    }
    li.multi-select__input:first-child {
        margin-left: 2px;
    }

    /* One selected option */
    li.multi-select__selected-option {
        background-color: #e4e4e4;
        border: 1px solid #aaa;
        border-radius: 4px;
        padding: 5px;
    }

    li.multi-select__selected-option > i {
        color: #999;
        cursor: pointer;
        display: inline-block;
        font-weight: bold;
        margin-right: 2px;
    }
    li.multi-select__selected-option > i:hover {
        color: #555;
    }

    /* Text input */
    input.multi-select__input {
        height: 32px;
        width: 100%;
        padding: 0;
        font-size: 100%;
        line-height: 1.42857143;
        color: #555;
        border: none;
        background: transparent;
        outline: 0;
        box-shadow: none;
        -webkit-appearance: textfield;
        box-sizing: border-box;
    }

    /* Drop down list container */
    div.multi-select__drop-down {
        width: 100%;
        max-height: 300px;
        min-height: 28px;
        display: block;
        position: absolute;
        border: 1px solid lightgray;
        border-radius: 4px;
        background-color: white;
        padding: 2px 1px;
        margin-top: 1px;
        overflow-x: hidden;
        z-index: 1;
    }
    div.multi-select__drop-down.multi-select__has-options {
        overflow-y: scroll;
    }

    /* Drop down list option block */
    div.multi-select__drop-down > div {
        width: 100%;
        height: 24px;
        vertical-align: middle;
        background-color: white;
        border: 1px solid transparent;
        border-radius: 1px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    div.multi-select__drop-down > div.multi-select__selected {
        background-color: #eaeaea;
    }

    div.multi-select__drop-down > div.multi-select__hovered,
    div.multi-select__drop-down > div:hover {
        background-color: #dddddd;
        border: 1px dashed #d1d1d1;
    }

    /* Text style */
    li.multi-select__selected-option > span,
    li.multi-select__selected-option > input,
    div.multi-select__drop-down > div
    {
        font-size: 14px;
        font-family: inherit;
        text-decoration: none;
    }

    /* Dropped down option path */
    div.multi-select__drop-down > div {
        justify-content: space-between;
        display: flex;
        padding-left: 2px;
    }

    div.multi-select__drop-down > div > span:last-child {
        font-size: 10px;
        color: #555;
        margin-right: 6px;
    }

</style>
