<script setup>
import _ from 'lodash'
const { user } = useUserSession()

import DotsTriangle from '~icons/mdi/dots-triangle'
import BeakerOutline from '~icons/mdi/beaker-outline'
import DnaIcon from '~icons/mdi/dna'

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Projects', icon: 'pi pi-fw pi-home', to: '/sge/projects' },
            { label: 'Cycles', icon: 'pi pi-fw pi-spinner-dotted', to: '/sge/cycles' },
            { label: 'Targets', icon: 'pi pi-fw pi-bullseye', to: '/sge/targets' },
            { label: 'Genes', iconComponent: DnaIcon, to: '/sge/genes' },
            { label: 'Regions', icon: 'pi pi-fw pi-map', to: '/sge/regions' },
            { label: 'PCR experiments', icon: 'pi pi-fw pi-qrcode', to: '/sge/pcr-experiments' },
            { label: 'Transfection experiments', icon: 'pi pi-fw pi-sparkles', to: '/sge/transfect-experiments' },
            { label: 'Plasmid experiments', icon: 'pi pi-fw pi-spinner', to: '/sge/plasmid-experiments' },
            { label: 'Extraction experiments', icon: 'pi pi-fw pi-directions', to: '/sge/extraction-experiments' },
            { label: 'Pellets', iconComponent: DotsTriangle, to: '/sge/pellets' },
            { label: 'Storage boxes', icon: 'pi pi-fw pi-box', to: '/sge/storage-boxes' },
            { label: 'Reagent Lots', iconComponent: BeakerOutline, to: '/sge/lots' },
        ]
    },
    {
        label: 'Admin',
        hidden: !_.get(user?.value, 'isAdmin'),
        items: [
            { label: 'Users', icon: 'pi pi-fw pi-user', to: '/admin/users' },
            { label: 'Groups', icon: 'pi pi-fw pi-users', to: '/admin/user-groups' },
        ]
    },
    {
        label: 'UI Showcase',
        hidden: !_.get(user?.value, 'isAdmin'),
        items: [{
            label: 'UI Components',
            items: [
                { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
                { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
                { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
                { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
                { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
                { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
                { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
                { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
                { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
                { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
                { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
                { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
                { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
                { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline' },
                { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
            ]
        },
        {
            label: 'Sample Pages',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-home',
                    to: '/dashboard'
                },
                {
                    label: 'Landing',
                    icon: 'pi pi-fw pi-globe',
                    to: '/landing'
                },
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/uikit/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/uikit/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            to: '/uikit/auth/access'
                        }
                    ]
                },
                {
                    label: 'Crud',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/crud'
                },
                {
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/notfound'
                },
                {
                    label: 'Empty',
                    icon: 'pi pi-fw pi-circle-off',
                    to: '/empty'
                }
            ]
        },
        {
            label: 'Hierarchy',
            items: [
                {
                    label: 'Submenu 1',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [
                        {
                            label: 'Submenu 1.1',
                            icon: 'pi pi-fw pi-bookmark',
                            items: [
                                { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                            ]
                        },
                        {
                            label: 'Submenu 1.2',
                            icon: 'pi pi-fw pi-bookmark',
                            items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                        }
                    ]
                },
                {
                    label: 'Submenu 2',
                    icon: 'pi pi-fw pi-bookmark',
                    items: [
                        {
                            label: 'Submenu 2.1',
                            icon: 'pi pi-fw pi-bookmark',
                            items: [
                                { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                            ]
                        },
                        {
                            label: 'Submenu 2.2',
                            icon: 'pi pi-fw pi-bookmark',
                            items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                        }
                    ]
                }
            ]
        },
        {
            label: 'Get Started',
            items: [
                {
                    label: 'Documentation',
                    icon: 'pi pi-fw pi-book',
                    to: '/documentation'
                },
                {
                    label: 'View Source',
                    icon: 'pi pi-fw pi-github',
                    url: 'https://github.com/primefaces/sakai-vue',
                    target: '_blank'
                }
            ]
        }]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator && !item.hidden" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
