<template>
    <q-item>
        <q-item-section
            side
            top
        >
            <q-icon
                :name="icon"
                :color="color"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="text-subtitle1"
            >
                {{ typeTerm }}
                {{ direction }}
                {{ number | destinationFormat }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ call.start_time | smartTime }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Duration') }}: {{ call.duration }}
            </q-item-label>
            <q-item-label
                caption
            >
                <span>
                    {{ $t('Cost') }}
                </span>
                <span>
                    {{ totalCustomerCostRounded | wholeCurrency }}
                </span>
                <span
                    v-if="call.currency && call.currency.length > 0"
                >
                    ({{ call.currency }})
                </span>
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item-start-call
                    v-if="callAvailable"
                    @click="startCall"
                />
                <csc-popup-menu-item
                    icon="call_received"
                    color="primary"
                    :label="blockIncomingLabel"
                    @click="toggleBlockIncoming"
                />
                <csc-popup-menu-item
                    icon="call_made"
                    color="primary"
                    :label="blockOutgoingLabel"
                    @click="toggleBlockOutgoing"
                />
                <csc-popup-menu-item
                    icon="block"
                    color="primary"
                    :label="blockBothLabel"
                    @click="toggleBlockBoth"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import _ from 'lodash'
import {
    Platform
} from 'quasar'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
import {
    callIconColor,
    callIcon
} from 'src/helpers/call-utils'
export default {
    name: 'CscCallItem',
    components: { CscPopupMenuItemStartCall, CscPopupMenuItem, CscMoreMenu },
    props: {
        call: {
            type: Object,
            default: null
        },
        callAvailable: {
            type: Boolean,
            default: false
        },
        blockIncomingLabel: {
            type: String,
            default: ''
        },
        blockOutgoingLabel: {
            type: String,
            default: ''
        },
        blockBothLabel: {
            type: String,
            default: ''
        },
        blockBothPossible: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {}
    },
    computed: {
        number () {
            if (this.call.direction === 'out') {
                return this.call.callee
            } else {
                return this.call.caller
            }
        },
        totalCustomerCostRounded () {
            const formatter = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })

            return formatter.format(this.call.total_customer_cost)
        },
        numberDialBack () {
            if (_.isObject(this.call.relatedCall)) {
                return this.call.relatedCall.caller
            } else if (this.call.direction === 'out') {
                return this.call.callee
            } else {
                return this.call.caller
            }
        },
        direction () {
            if (this.call.direction === 'out') {
                return this.$t('to')
            } else {
                return this.$t('from')
            }
        },
        typeTerm () {
            if (this.call.call_type === 'call') {
                return this.$t('Call')
            } else {
                return this.$t('Call forwarded')
            }
        },
        icon () {
            return callIcon(this.call)
        },
        color () {
            return callIconColor(this.call)
        },
        isMobile () {
            return Platform.is.mobile
        }
    },
    methods: {
        startCall () {
            this.$emit('start-call', this.numberDialBack)
        },
        toggleBlockIncoming () {
            this.$emit('toggle-block-incoming')
        },
        toggleBlockOutgoing () {
            this.$emit('toggle-block-outgoing')
        },
        toggleBlockBoth () {
            this.$emit('toggle-block-both')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
