<script lang="ts">
  import AppWrapper from './AppWrapper.svelte';
  import AppTranslate from './AppTranslate.svelte';
</script>

<AppWrapper>
  <div class="root__wrapper">
    <AppTranslate></AppTranslate>
  </div>
</AppWrapper>

<style>
  .root__wrapper {
    width: 100%;
  }
</style>
