<template>
    <csc-dialog
        ref="dialogComp"
        :title="title"
        :title-icon="titleIcon"
        :title-icon-color="titleIconColor"
        :opened="opened"
        @close="onClose()"
    >
        <div
            slot="content"
        >
            {{ message }}
        </div>
        <q-btn
            slot="actions"
            :icon="titleIcon"
            :color="color"
            flat
            @click="confirm"
        >
            {{ $t('Confirm') }}
        </q-btn>
    </csc-dialog>
</template>

<script>
import CscDialog from './CscDialog'

export default {
    name: 'CscConfirmDialog',
    components: {
        CscDialog
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        titleIcon: {
            type: String,
            default: ''
        },
        titleIconColor: {
            type: String,
            default: 'primary'
        },
        message: {
            type: String,
            default: ''
        },
        opened: {
            type: Boolean,
            default: false
        },
        color: {
            type: String,
            default: 'primary'
        }
    },
    data () {
        return {
        }
    },
    methods: {
        open () {
            this.$refs.dialogComp.open()
        },
        close () {
            this.$refs.dialogComp.close()
        },
        onClose () {
            this.$emit('closed')
        },
        cancel () {
            this.close()
            this.$emit('cancel')
        },
        confirm () {
            this.close()
            this.$emit('confirm')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
