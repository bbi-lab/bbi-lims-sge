<script setup>
import _ from 'lodash'
const { user } = useUserSession()

import Molecule from '~icons/mdi/molecule'
import DotsTriangle from '~icons/mdi/dots-triangle'
import BeakerOutline from '~icons/mdi/beaker-outline'
import DnaIcon from '~icons/mdi/dna'
import IconParkSolidExperiment from '~icons/icon-park-solid/experiment'
import PhGridNineFill from '~icons/ph/grid-nine-fill'
import FluentRun16Filled from '~icons/fluent/run-16-filled'
import FluentMolecule16Filled from '~icons/fluent/molecule-16-filled'
import MdiMagic from '~icons/mdi/magic'

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Projects', icon: 'pi pi-fw pi-home', to: '/sge/projects' },
            { label: 'Cycles', icon: 'pi pi-fw pi-spinner-dotted', to: '/sge/cycles' },
            { label: 'Targets', icon: 'pi pi-fw pi-bullseye', to: '/sge/targets' },
            { label: 'Genes', iconComponent: DnaIcon, to: '/sge/genes' },
            { label: 'Regions', icon: 'pi pi-fw pi-map', to: '/sge/regions' },
            { label: 'Plasmids', icon: 'pi pi-fw pi-spinner',
                items: [
                    { label: 'sgRNA', to: '/sge/sg-rna-plasmids' },
                    { label: 'SNV Library', to: '/sge/snv-lib-plasmids' },
                    { label: 'HA pUC19', to: '/sge/ha-puc-19-plasmids' },
                ]
            },
            { label: 'Pellets', iconComponent: DotsTriangle, to: '/sge/pellets' },
            { label: 'Nucleic Acids', iconComponent: Molecule,
                items: [
                    { label: 'DNA', to: '/sge/dna' },
                    { label: 'RNA', to: '/sge/rna' },
                ]
            },
            { label: 'Oligos', iconComponent: FluentMolecule16Filled,
                items: [
                    { label: 'sgRNA', to: '/sge/sg-rna-oligos' },
                    { label: 'SGE Oligos', to: '/sge/sge-oligos' },
                    { label: 'Clonal HA', to: '/sge/clonal-has' },
                    { label: 'HA products', items: [
                        { label: 'HA PCR products', to: '/sge/ha-pcr-products' },
                        { label: 'HA pUC19 PCR products', to: '/sge/ha-puc-19-pcr-products' },
                        { label: 'HA pUC19 Gibson products', to: '/sge/ha-puc-19-gibson-products' },
                    ]},
                    { label: 'SNVlib products', items: [
                        { label: 'SNVlib AMP products', to: '/sge/snv-lib-amp-products' },
                        { label: 'SNVlib LIN products', to: '/sge/snv-lib-lin-products' },
                        { label: 'SNVlib Gibson products', to: '/sge/snv-lib-gibson-products' },
                        { label: 'SNVlib Golden Gate products', to: '/sge/snv-lib-golden-gate-products' },
                    ]},
                    { label: 'Primers', items: [
                        { label: 'Amplification primers', to: '/sge/amplification-primers' },
                        { label: 'Linearization primers', to: '/sge/linearization-primers' },
                        { label: 'Homology Arm primers', to: '/sge/homology-arm-primers' },
                        { label: 'Homology Arm pUC19 primers', to: '/sge/homology-arm-puc-19-primers' },
                        { label: 'DNA PreSeq 1 primers', to: '/sge/preseq-1-primers' },
                        { label: 'DNA PreSeq 2 primers', to: '/sge/preseq-2-primers' },
                        { label: 'RNA RT primers', to: '/sge/rna-rt-primers' },
                        { label: 'RNA PreSeq 1 primers', to: '/sge/rna-preseq-1-primers' },
                        { label: 'RNA PreSeq 2 primers', to: '/sge/rna-preseq-2-primers' },
                        { label: 'Index primers', to: '/sge/index-primers' },
                    ]},
                ]
             },
            { label: 'Plates/Storage', iconComponent: PhGridNineFill, to: '/sge/plates' },
            { label: 'Experiments', iconComponent: IconParkSolidExperiment,
                items: [
                    { label: 'sgRNA Cloning', to: '/sge/sg-rna-cloning-experiments' },
                    { label: 'HA Cloning', to: '/sge/ha-cloning-experiments' },
                    { label: 'SNV Library Cloning', to: '/sge/snv-lib-cloning-experiments' },
                    { label: 'Transfection', to: '/sge/transfect-experiments' },
                    { label: 'Extraction', to: '/sge/extraction-experiments' },
                    { label: 'PCR', to: '/sge/pcr-experiments' },
                ]
            },
            { label: 'Reagents', iconComponent: BeakerOutline,
                items: [
                    { label: 'Lots', to: '/sge/lots' },
                    { label: 'Reagent List', to: '/sge/reagents' },
                ]
            },
            { label: 'Sequencing', iconComponent: FluentRun16Filled,
                items: [
                    { label: 'Internal Samples', to: '/sge/internal-samples' },
                    { label: 'External Samples', to: '/sge/external-samples' },
                    { label: 'Sequencing Runs', to: '/sge/sequencing-runs' },
                ]
            },
            { label: 'External', icon: 'pi pi-fw pi-external-link',
                items: [
                    {
                        label: 'UCSC In-silico PCR',
                        url: 'https://genome.ucsc.edu/cgi-bin/hgPcr',
                        target: '_blank'
                    },
                    {
                        label: 'UCSC Blat',
                        url: 'https://genome.ucsc.edu/cgi-bin/hgBlat',
                        target: '_blank',
                    },
                    {
                        label: 'Primer3',
                        url: 'https://bioinfo.ut.ee/primer3-0.4.0',
                        target: '_blank',
                    },
                ]
             },
            { label: 'Experimental', class: 'italic', iconComponent: MdiMagic,
                items: [
                    { label: 'JBrowse', to: '/sge/experimental/jbrowse' },
                ]
             },
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
