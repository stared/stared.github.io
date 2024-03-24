<template>
  <div>
    <div class="flex">
      <div class="flex-column text">
        <ContentDoc path="/text-components/me" />
      </div>
      <div class="flex-column image">
        <!-- Example image, replace with your own -->
        <img
          class="main-img"
          alt="A photo of Piotr Migdał"
          src="~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-600px.jpg"
        />
      </div>
    </div>
  </div>
</template>

<style>
.flex {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flex-column {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 300px;
}

.main-img {
  max-width: 100%;
}
</style>
