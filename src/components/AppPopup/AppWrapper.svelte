<script lang="ts">
  import Heroicon from '@martinse/svelte-heroicons';
  import { cog as solidCog } from '@martinse/svelte-heroicons/dist/solid';
  function openOptions() {
    browser.runtime.openOptionsPage();
  }
</script>

<div role="main" class="root">
  <slot />
  <div class="footer">
    <div class="deepl">
      <a href="https://www.deepl.com" target="_blank"><img src="./../images/deepl.svg" alt="" /></a>
    </div>
    <div class="params">
      <a href={'#'} on:click={openOptions} class="settings"><Heroicon icon={solidCog} size="1.5rem" class="icon" /></a>
    </div>
  </div>
</div>
