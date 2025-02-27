<template>
    <q-item
        :disable="loading || !mapping.enabled"
    >
        <q-item-section
            side
        >
            <q-icon
                name="subdirectory_arrow_right"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>
                <template
                    v-if="destinationIndex === 0 && mapping.type !== 'cft'"
                >
                    {{ $t('Forwarded to') }}
                </template>
                <template
                    v-else-if="destinationIndex === 0 && mapping.type === 'cft'"
                >
                    {{ $t('After') }}
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ ringTimeout }}
                        {{ $t('seconds') }}
                        <q-popup-edit
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow', null)"
                            @save="updateRingTimeoutEvent()"
                        >
                            <csc-input
                                v-model="changedDestinationTimeout"
                                type="number"
                                dense
                            >
                                <template
                                    v-slot:prepend
                                >
                                    <q-icon
                                        name="access_time"
                                    />
                                </template>
                            </csc-input>
                        </q-popup-edit>
                    </span>
                    {{ $t('forwarded to') }}
                </template>
                <template
                    v-else
                >
                    {{ $t('After') }}
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ destinationPrevious.timeout }}
                        {{ $t('seconds') }}
                        <q-popup-edit
                            v-model="changedDestinationTimeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow', null)"
                            @save="updateDestinationTimeoutEvent({
                                destinationTimeout: changedDestinationTimeout,
                                destinationIndex: destinationIndex - 1,
                                destinationSetId: destinationSet.id
                            })"
                        >
                            <csc-input
                                v-model="changedDestinationTimeout"
                                type="number"
                                dense
                            >
                                <template
                                    v-slot:prepend
                                >
                                    <q-icon
                                        name="access_time"
                                    />
                                </template>
                            </csc-input>
                        </q-popup-edit>
                    </span>
                    {{ $t('forwarded to') }}
                </template>
                <csc-cf-destination-custom-announcement
                    v-if="isDestinationTypeCustomAnnouncement(destination.destination) && destination.announcement_id"
                    v-model="announcement"
                    :destination="destination"
                    :announcements="announcements"
                    @input="updateAnnouncementEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    })"
                />
                <csc-cf-destination-number
                    v-else-if="isDestinationTypeNumber(destination.destination)"
                    v-model="changedDestination"
                    :destination="destination"
                    @input="updateDestinationEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    })"
                />
                <csc-cf-destination
                    v-else
                    :value="destination"
                />
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item-delete
                    @click="removeDestinationEvent({
                        destinationIndex: destinationIndex,
                        destinationSetId: destinationSet.id
                    })"
                />
            </csc-more-menu>
        </q-item-section>
        <q-inner-loading
            :showing="$wait.is(waitIdentifier)"
            color="primary"
            class="bg-main-menu"
        >
            <csc-spinner />
        </q-inner-loading>
    </q-item>
</template>

<script>
import _ from 'lodash'
import {
    mapActions,
    mapGetters
} from 'vuex'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscInput from 'components/form/CscInput'
import CscSpinner from 'components/CscSpinner'
import {
    showGlobalError
} from 'src/helpers/ui'
import destination from 'src/mixins/destination'
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscCfDestinationCustomAnnouncement from 'components/call-forwarding/CscCfDestinationCustomAnnouncement'
import CscCfDestinationNumber from 'components/call-forwarding/CscCfDestinationNumber'
export default {
    name: 'CscCfGroupItem',
    components: { CscCfDestinationNumber, CscCfDestinationCustomAnnouncement, CscCfDestination, CscSpinner, CscInput, CscPopupMenuItemDelete, CscMoreMenu },
    mixins: [destination],
    props: {
        mapping: {
            type: Object,
            required: true
        },
        destination: {
            type: Object,
            required: true
        },
        destinationPrevious: {
            type: Object,
            default: null
        },
        destinationIndex: {
            type: Number,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        sourceSet: {
            type: Object,
            default: undefined
        },
        timeSet: {
            type: Object,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            changedDestination: this.destination.simple_destination,
            changedDestinationTimeout: 0,
            announcement: null
        }
    },
    computed: {
        ...mapGetters('callForwarding', [
            'ringTimeout',
            'announcements'
        ]),
        waitIdentifier () {
            return 'csc-cf-group-item-' + this.destinationSet.id + '-' + this.destinationIndex
        }
    },
    watch: {
        destination () {
            this.changedDestination = this.destination.simple_destination
        }
    },
    beforeMount () {
        if (this.destination.announcement_id) {
            this.setAnnouncement()
        }
    },
    async mounted () {
        if (this.mapping.type === 'cft' && this.destinationIndex === 0) {
            this.changedDestinationTimeout = this.ringTimeout
        } else if (this.destinationPrevious) {
            this.changedDestinationTimeout = this.destinationPrevious.timeout
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'updateDestination',
            'removeDestination',
            'updateDestinationTimeout',
            'updateRingTimeout',
            'rewriteDestination',
            'getAnnouncementById',
            'updateAnnouncement'
        ]),
        async updateDestinationEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            try {
                const validatedDest = await this.rewriteDestination(this.changedDestination)
                await this.updateDestination({ ...payload, destination: validatedDest })
            } catch (err) {
                showGlobalError(err.message)
            } finally {
                this.$wait.end(this.waitIdentifier)
            }
        },
        async removeDestinationEvent (payload) {
            this.$q.dialog({
                title: this.$t('Delete destination'),
                message: this.$t('You are about to delete this destination'),
                color: 'negative',
                cancel: true,
                persistent: true
            }).onOk(async data => {
                this.$wait.start(this.waitIdentifier)
                if (this.destinationSet.destinations.length > 1) {
                    await this.removeDestination(payload)
                    this.setAnnouncement()
                } else {
                    this.$emit('delete-last', payload)
                }
                this.$wait.end(this.waitIdentifier)
            })
        },
        async updateDestinationTimeoutEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            await this.updateDestinationTimeout(payload)
            this.$wait.end(this.waitIdentifier)
        },
        async updateRingTimeoutEvent () {
            this.$wait.start('csc-cf-mappings-full')
            await this.updateRingTimeout(this.changedDestinationTimeout)
            this.$wait.end('csc-cf-mappings-full')
        },
        setAnnouncement () {
            this.announcement = _.first(this.announcements.filter(announcement => announcement.value === this.destination.announcement_id))
        },
        async updateAnnouncementEvent (payload) {
            this.$wait.start(this.waitIdentifier)
            try {
                await this.updateAnnouncement({ ...payload, announcementId: this.announcement.value })
                this.setAnnouncement()
            } catch (err) {
                showGlobalError(err.message)
            } finally {
                this.$wait.end(this.waitIdentifier)
            }
        },
        checkAnnouncement () {
            const fieldFilled = this.announcement > 0
            if (!fieldFilled) {
                showGlobalError(this.$t('Please select an option'))
            }
            return fieldFilled
        }
    }
}
</script>
