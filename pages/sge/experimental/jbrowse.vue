<template>
    <Dropdown v-model="selectedGene" :options="targetGenes" optionLabel="symbol" placeholder="Select a Gene" class="ml-5 mr-5" />
    <Dropdown v-model="selectedTarget" :options="filteredTargets" optionLabel="name" placeholder="Select a Target" class="ml-5 mr-5" />

    <div id="jbrowse_linear_genome_view"></div>

    <button class="p-button m-2" id="showviewstate">Show view state</button>

    <textarea id="viewstate" name="viewstate" rows="20" cols="80"></textarea>
    <p>updates:</p>
    <textarea
      id="update"
      name="update"
      rows="5"
      cols="80"
      wrap="off"
    ></textarea>
</template>

<script setup>
import { useHead } from '#imports'
import { RecordService } from '~/utils/service/RecordService'
import _ from 'lodash'

const config = useRuntimeConfig()
const targets = ref([])
const targetGenes = ref([])
const selectedGene = ref(null)
const selectedTarget = ref(null)
const state = ref(null)

const filteredTargets = computed(() => {
    if (!selectedGene?.value) return []
    return targets.value?.filter(t => t.region.gene.symbol === selectedGene.value.symbol)
})

useHead({
  script: [
    {
        src: 'https://unpkg.com/@jbrowse/react-linear-genome-view2/dist/react-linear-genome-view.umd.production.min.js',
        crossorigin: true,
        onload: () => {
            const { React, createRoot, createViewState, JBrowseLinearGenomeView } = JBrowseReactLinearGenomeView

            const updates = document.getElementById('update')

            state.value = new createViewState({
                assembly: {
                    name: 'hg38',
                    sequence: {
                    type: 'ReferenceSequenceTrack',
                    trackId: 'GRCh38-ReferenceSequenceTrack',
                    adapter: {
                        type: 'BgzipFastaAdapter',
                        uri: 'https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz',
                    },
                    },
                    refNameAliases: {
                    adapter: {
                        type: 'RefNameAliasAdapter',
                        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/hg38_aliases.txt',
                    },
                    },
                    cytobands: {
                    adapter: {
                        type: 'CytobandAdapter',
                        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/cytoBand.txt',
                    },
                    },
                },
                tracks: [
                    {
                    type: 'FeatureTrack',
                    trackId: 'genes',
                    name: 'NCBI RefSeq Genes',
                    assemblyNames: ['hg38'],
                    category: ['Genes'],
                    adapter: {
                        type: 'Gff3TabixAdapter',
                        uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/ncbi_refseq/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz',
                    },
                    textSearching: {
                        textSearchAdapter: {
                            type: 'TrixTextSearchAdapter',
                            textSearchAdapterId: 'gff3tabix_genes-index',
                            uri: 'https://jbrowse.org/genomes/GRCh38/ncbi_refseq/trix/GCA_000001405.15_GRCh38_full_analysis_set.refseq_annotation.sorted.gff.gz.ix',
                            assemblyNames: ['GRCh38'],
                        },
                    },
                    },
                    {
                        type: 'FeatureTrack',
                        trackId: 'repeats_hg38',
                        name: 'Repeats',
                        assemblyNames: ['hg38'],
                        category: ['Annotation'],
                        adapter: {
                            type: 'BigBedAdapter',
                            uri: 'https://jbrowse.org/genomes/GRCh38/repeats.bb',
                        },
                    },
                    {
                        type: 'AlignmentsTrack',
                        trackId: 'NA12878.alt_bwamem_GRCh38DH.20150826.CEU.exome',
                        name: 'NA12878 Exome',
                        assemblyNames: ['hg38'],
                        category: ['1000 Genomes', 'Alignments'],
                        adapter: {
                            type: 'CramAdapter',
                            uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/alignments/NA12878/NA12878.alt_bwamem_GRCh38DH.20150826.CEU.exome.cram',

                            sequenceAdapter: {
                            type: 'BgzipFastaAdapter',
                            uri: 'https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz',
                            },
                        },
                    },
                    {
                        type: 'VariantTrack',
                        trackId:
                            'ALL.wgs.shapeit2_integrated_snvindels_v2a.GRCh38.27022019.sites.vcf',
                        name: '1000 Genomes Variant Calls',
                        assemblyNames: ['hg38'],
                        category: ['1000 Genomes', 'Variants'],
                        adapter: {
                            type: 'VcfTabixAdapter',
                            uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/variants/ALL.wgs.shapeit2_integrated_snvindels_v2a.GRCh38.27022019.sites.vcf.gz',
                        },
                    },
                    {
                        type: 'QuantitativeTrack',
                        trackId: 'hg38.100way.phyloP100way',
                        name: 'hg38.100way.phyloP100way',
                        category: ['Conservation'],
                        assemblyNames: ['hg38'],
                        adapter: {
                            type: 'BigWigAdapter',
                            uri: 'https://hgdownload.cse.ucsc.edu/goldenpath/hg38/phyloP100way/hg38.phyloP100way.bw',
                        },
                    },
                    {
                        type: 'AlignmentsTrack',
                        trackId: 'skbr3_pacbio',
                        name: 'SKBR3 pacbio',
                        assemblyNames: ['hg38'],
                        adapter: {
                            type: 'BamAdapter',
                            uri: 'https://s3.amazonaws.com/jbrowse.org/genomes/GRCh38/skbr3/SKBR3_Feb17_GRCh38.sorted.bam',
                        },
                    },
                ],
                defaultSession: {
                    name: 'this session',
                    margin: 0,
                    view: {
                    id: 'linearGenomeView',
                        type: 'LinearGenomeView',
                        init: {
                            assembly: 'hg38',
                            loc: '10:29,838,565..29,838,850',
                            tracks: [
                            'GRCh38-ReferenceSequenceTrack',
                            'genes',
                            'NA12878.alt_bwamem_GRCh38DH.20150826.CEU.exome',
                            'hg38.100way.phyloP100way',
                            'ALL.wgs.shapeit2_integrated_snvindels_v2a.GRCh38.27022019.sites.vcf',
                            ],
                        },
                    },
                },
                onChange: patch => {
                    updates.innerHTML += JSON.stringify(patch) + '\n'
                },
            })

            const textArea = document.getElementById('viewstate')
            document.getElementById('showviewstate').addEventListener('click', () => {
                    textArea.innerHTML = JSON.stringify(state.value.session.view, undefined, 2)
            })

            const root = createRoot(
                document.getElementById('jbrowse_linear_genome_view'),
            )
            root.render(
                React.createElement(JBrowseLinearGenomeView, {
                    viewState: state.value,
                }),
            )
        }
    },
  ],
})

const navTo = (chr, start, end) => {
    if (state.value?.session?.view) {
         state.value.session.view.navToLocString(`${chr}:${start}..${end}`)
    }
}

watch(() => selectedTarget.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        console.log(newValue)
        navTo(newValue.region.gene.chromosome, newValue.editStart, newValue.editStop)
    }
})

onBeforeMount(async () => {
    targets.value = _.filter(await RecordService.getRecords(`${config.public.apiBase}/targets`, {
        region: {
            columns: {},
            with: {
                gene: {
                    columns: {
                        id: true,
                        name: true,
                        symbol: true,
                        chromosome: true,
                    },
                },
            },
        },
    }), (target) => {
        return _.isInteger(_.get(target, 'editStart')) && _.isInteger(_.get(target, 'editStop')) && _.isString(_.get(target, 'region.gene.chromosome'))
    })
    targetGenes.value = _.uniqBy(_.map(targets.value, (t) => { return {symbol: t.region.gene.symbol, id: t.region.gene.id}}), 'id')
})
</script>
