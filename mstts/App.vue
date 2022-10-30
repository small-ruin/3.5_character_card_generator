<template>
<a-textarea v-model:value="input" />
<a-button @click="onAnalysis" type="primary">Analysis</a-button>
<a-button @click="download">Download</a-button>
<section class="cast">
    <div v-for="(v, k) of pcs" :key="k" >
        {{k}}
        <a-select :options="voices" v-model:value="pcs[k]">
        </a-select>
    </div>
</section>
<section class="analysis-result">
    <div class="panel">
        <div v-for="(i, idx) of lines" :key="i">
            {{i.sender}}
            <a-input v-model:value="i.content" />
            <button @click="lines.splice(idx, 1)">Remove</button>
            <button v-if="idx !== 0" @click="up(idx)">up</button>
            <button v-if="idx !== lines.length-1" @click="down(idx)">down</button>
            <button @click="separate(idx)">separate</button>
        </div>
    </div>
    <div class="result">
        <pre>
            {{'<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">'}}
            {{result}}
            {{'</speak>'}}
        </pre>
    </div>
</section>
</template>
<script setup>
import { computed, ref } from "@vue/reactivity";
import { genLogLine2XMLByCast, voices } from "./2xml"
const input = ref()
const lines = ref([])
const pcs = ref({})
const result = computed(() => {
    const line2xml = genLogLine2XMLByCast(pcs.value)
    return lines.value.map(line2xml).join('\n')
})
function onAnalysis() {
    lines.value = input.value.split('\n')
        .map(l => {
            const [, sender, content] = /<(.+)>(.+)/.exec(l) || []
            if (sender && !(sender in pcs.value))
                pcs.value[sender] =  null
            return {sender, content}
        })
        .filter(l => l.sender)
}
function up(idx) {
    const current = lines.value[idx]
    lines.value.splice(idx, 1)
    lines.value.splice(idx-1, 0, current)
}
function down(idx) {
    const current = lines.value[idx]
    lines.value.splice(idx, 1)
    lines.value.splice(idx+1, 0, current)
}
function separate(idx) {
    lines.value.splice(idx, 0, 'COMMEND:SEPARATE')
}
function download() {
  const blob1 = new Blob(
    [
        '<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">',
      result.value,
      '</speak>'
    ],
    { type: "text/plain;charset=utf-8" }
  )
  const blob2 = new Blob(
    [
      lines.value.filter(i => i !== 'COMMEND:SEPARATE').map(i => `<${i.sender}> ${i.content}`).join('\n')
    ],
    { type: "text/plain;charset=utf-8" }
  )
  const a = document.createElement('a')

  a.href = URL.createObjectURL(blob1);
  a.download = 'ttsxml.txt';
  a.click()

  a.href = URL.createObjectURL(blob2);
  a.download = 'text.txt';
  a.click()
}
</script>
<style>
.analysis-result {
    display: flex;
    justify-content: space-between;
}
.analysis-result .panel {
    width: 45%
}
.analysis-result .result {
    width: 50%
}
.cast .ant-select {
    width: 100px
}
</style>
