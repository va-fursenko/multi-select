<template>
    <div class="multi-select__container">

        <div class="multi-select__selected-input" ref="inputContainer">
            <div class="multi-select__selected" @click="setInputFocus()">
                <ul class="multi-select__selected" ref="list" @click="toggleDropDown(true, true)">
                    <li v-for="option in selectedOptions" class="multi-select__selected-option" ref="selectedOptions">
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
                            @keypress="updateTextInputWidth()"
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
                @click="toggleDropDown(!isDroppedDown, false); $refs.textInput.focus()"
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
                v-for="option in droppedDownOptions"
                :class="{'multi-select__selected': isSelected(option)}"
                @click="selectOption(option)"
            >{{ option.name }}</div>
        </div>

    </div>
</template>

<script lang="babel">
    import { App } from './common/app';

    /* Custom component event */
    const EVENT_DROP_DOWN_SHOW = 'drop-down-show';
    const EVENT_DROP_DOWN_HIDE = 'drop-down-hide';

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
            // Flag, allows empty country
            allowEmpty: {
                type: Boolean,
                default: false
            },
            // Component DOM id
            id: {
                type: String,
                default: ''
            }
        },

        // Data store
        data () {
            return {
                // Component HTML options
                caption: '',

                // Component settings
                allowEmpty: false,
                dropDownLimit: 0,

                // Inner properties
                isDroppedDown: false,
                dropDownHoveredIndex: null,
                dropDownByCaption: true,
                // Selected options indexes in this.options array
                selectedOptions: []
            };
        },

        // Computed properties
        computed: {
            /**
             * Get dropped down countries list
             *
             * @return {Array}
             */
            droppedDownOptions () {
                if (this.caption == '' || !this.dropDownByCaption) {
                    return this.options;
                }
                let selText = this.caption.toLowerCase(),
                    droppedDown = [];
                for (let i = 0; i < this.options.length && (this.dropDownLimit == 0 || droppedDown.length <= this.dropDownLimit); i++) {
                    if (this.caption == '' || this.options[i].name.substr(0, selText.length).toLowerCase() == selText) {
                        droppedDown.push(this.options[i]);
                    }
                }
                return droppedDown;
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
                    this.$emit(EVENT_DROP_DOWN_SHOW);
                    //this.$refs.dropDown.dispatchEvent(new Event(EVENT_DROP_DOWN_SHOW));
                    // Hide drop down list
                } else {
                    // Remove global document click listener
                    document.removeEventListener('click', this.documentClickHandler);
                    this.dropDownHoveredIndex = null;
                    // Dispatch custom component event
                    this.$emit(EVENT_DROP_DOWN_HIDE);
                    //this.$refs.dropDown.dispatchEvent(new Event(EVENT_DROP_DOWN_HIDE));
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
            }
        },

        // Caption change watcher
        watch: {
            /**
             * After caption changing droppedDown options should be alike
             *
             * @param value
             */
            caption (value) {
                this.dropDownByCaption = true;
            }
        },

        // Component create handler
        created () {
            Vue.nextTick(this.updateTextInputWidth);
            Vue.nextTick(() => {
                this.$refs.dropDown.style.width = this.$refs.inputContainer.getBoundingClientRect().width - 4 + 'px';
            });
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
        padding: 5px 4px;
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

    div.multi-select__drop-down > div:hover {
        background-color: #dddddd;
        border: 1px dashed #d1d1d1;
    }

    li.multi-select__selected-option > span,
    li.multi-select__selected-option > input,
    div.multi-select__drop-down > div
    {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 14px;
    }

</style>