<template>
    <span
        class="cursor-pointer"
    >
        <q-input
            v-model="internalValue"
            dense
            hide-bottom-space
            borderless
            filled
            :error="error"
            :error-message="errorMessage"
            :disable="$attrs.disable"
            @keyup="save"
            @clear="clear"
        />
    </span>
</template>

<script>
import { i18n } from 'src/boot/i18n'
export default {
    name: 'CscDataTableEditInput',
    props: {
        column: {
            type: Object,
            required: true
        },
        row: {
            type: Object,
            required: true
        },
        value: {
            type: [String, Number],
            default: undefined
        },
        saveLabel: {
            type: String,
            default: i18n.t('Save')
        }
    },
    data () {
        return {
            internalValue: this.value
        }
    },
    validations () {
        const config = {}
        if (this.column.componentValidations) {
            config.internalValue = {}
            this.column.componentValidations.forEach((validation) => {
                config.internalValue[validation.name] = validation.validator
            })
        }
        return config
    },
    computed: {
        error () {
            if (this.column.componentValidations) {
                return this.$v.internalValue.$error
            } else {
                return false
            }
        },
        errorMessage () {
            if (this.column.componentValidations) {
                const validation = this.column.componentValidations.find(validation =>
                    this.$v.internalValue[validation.name] === false
                )
                if (validation) {
                    return validation.error
                } else {
                    return undefined
                }
            } else {
                return undefined
            }
        }
    },
    watch: {
        value (value) {
            this.internalValue = value
        }
    },
    mounted () {
        this.internalValue = this.value
        this.$v.$reset()
    },
    methods: {
        validate () {
            if (this.column.componentValidations) {
                this.$v.$touch()
                return !this.$v.$invalid
            } else {
                return true
            }
        },
        save () {
            this.$v.$touch()
            this.$emit('changed', {
                column: this.column,
                row: this.row,
                value: this.internalValue
            })
        },
        clear () {
            this.$v.$reset()
        }
    }
}
</script>
