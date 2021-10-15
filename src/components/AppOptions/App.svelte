<script lang="ts">
    import AppWrapper from './AppWrapper.svelte';
    import AppForm from './AppForm.svelte';
  </script>
  
  <AppWrapper>
    <div class="root__wrapper">
      <AppForm></AppForm>
    </div>
  </AppWrapper>
  
  <style>
    .root__wrapper {
      width: 100%;
    }
  </style>
  