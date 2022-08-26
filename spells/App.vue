<template>
  <section class="form">
    <a-auto-complete
      v-model:value="value"
      :options="spellNames"
      placeholder="spell name"
      @select="onSelect"
      @search="onSearch"
    />
  </section>
  <section class="spell">
    <div class="spell-name">{{ selected }}</div>
    <pre class="spell-detail">{{ selectedSpell }}</pre>
  </section>
  <section class="class">
    <a-collapse>
      <a-collapse-panel v-for="(v, k) in classes" :key="k" :header="`${k}法术`">
        <p v-for="(item, index) in v" :key="index">
          {{ index }}环
          <a-popover v-for="s in item" :key="s" placement="topRight">
            <template #content>
              <pre  class="spell-detail">{{ spells[getSpellByKW(s.replace(/（.+）/, ""))] }}</pre>
            </template>
            <template #title class="spell-name">{{s}}</template>
            <p>{{ s }}</p>
          </a-popover>
        </p>
      </a-collapse-panel>
    </a-collapse>
  </section>
</template>

<script setup>
import { computed, ref } from "@vue/reactivity";
import spells from "./3r_spells.json";
import * as classes from "./class_spells";

const allSpellNames = Object.keys(spells).map((i) => ({ value: i }));

const selected = ref(null);
const selectedSpell = computed(() => spells[selected.value]);
const keyword = ref("");
const spellNames = computed(() => {
  return allSpellNames.filter(
    (n) => n.value.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1
  );
});

function onSelect(v) {
  selected.value = v;
}
function onSearch(v = "") {
  keyword.value = v;
}
function getSpellByKW(kw) {
  return allSpellNames.find(
    (n) => n.value.toLowerCase().indexOf(keyword.value.toLowerCase()) !== -1
  ).value;
}
</script>

<style>
html,
body,
.form,
.ant-select {
  width: 100%;
  font-size: 14px;
}
#app {
  padding: 10px;
}
.spell-name {
  color: brown;
  font-size: 22px;
  margin: 10px 0;
}
body .ant-popover-title {
    color: brown;
}
.ant-popover {
    max-width: 60%;
    min-width: 100em;
}
.spell-detail {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  white-space: pre-wrap;
}
</style>