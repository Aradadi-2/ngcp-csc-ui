<template>
    <csc-inline-alert
        icon="error"
        color="negative"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <slot />
        <template
            v-slot:action
        >
            <slot
                name="action"
            />
        </template>
    </csc-inline-alert>
</template>

<script>
import CscInlineAlert from 'components/CscInlineAlert'
export default {
    name: 'CscInlineAlertAlert',
    components: {
        CscInlineAlert
    }
}
</script>
