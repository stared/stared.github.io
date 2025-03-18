<template>
  <div class="kawaii-container">
    <!-- Cloud decorations -->
    <div class="kawaii-cloud cloud-1"></div>
    <div class="kawaii-cloud cloud-2"></div>

    <div class="kawaii-header">
      <div class="kawaii-photo-frame">
        <img
          src="~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-600px.jpg"
          class="kawaii-doodle floating"
          alt="A photo of Piotr Migdał"
        />
        <div class="kawaii-sparkle sparkle-1"></div>
        <div class="kawaii-sparkle sparkle-2"></div>
        <div class="kawaii-sparkle sparkle-3"></div>
      </div>
    </div>

    <div class="kawaii-content">
      <div class="kawaii-card text-card bouncing">
        <div class="kawaii-card-content">
          <ContentDoc path="/text-components/me" :head="false" />
        </div>
        <div class="kawaii-decoration decoration-1"></div>
        <div class="kawaii-decoration decoration-2"></div>
        <!-- Hearts decoration -->
        <div class="kawaii-heart heart-1"></div>
        <div class="kawaii-heart heart-2"></div>
      </div>
    </div>

    <div class="kawaii-footer">
      <div class="kawaii-star star-1"></div>
      <div class="kawaii-star star-2"></div>
      <div class="kawaii-star star-3"></div>
      <!-- Small cute cat icon at the bottom -->
      <div class="kawaii-cat">
        <div class="cat-ears">
          <div class="ear-left"></div>
          <div class="ear-right"></div>
        </div>
        <div class="cat-face">
          <div class="cat-eye left"></div>
          <div class="cat-eye right"></div>
          <div class="cat-nose"></div>
          <div class="cat-mouth"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";

HeaderData.default().setTitle("Homepage").useHead();
</script>

<style>
:root {
  --kawaii-pink: #ffd6e0;
  --kawaii-blue: #c9f0ff;
  --kawaii-purple: #ecd5ff;
  --kawaii-yellow: #fffcdd;
  --kawaii-mint: #d5ffea;
  --kawaii-text: #6a5d7b;
  --kawaii-heading: #ff6b9d;
}

.kawaii-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  overflow: hidden;
  font-family: "Comic Sans MS", "Marker Felt", sans-serif;
  color: var(--kawaii-text);
  line-height: 1.6;
}

/* Cloud decorations */
.kawaii-cloud {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  z-index: 1;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
}

.cloud-1 {
  width: 100px;
  height: 60px;
  top: 30px;
  left: 10%;
}

.cloud-1:before,
.cloud-1:after,
.cloud-2:before,
.cloud-2:after {
  content: "";
  position: absolute;
  background-color: white;
  border-radius: 50%;
}

.cloud-1:before {
  width: 70px;
  height: 70px;
  bottom: 0;
  left: 10px;
}

.cloud-1:after {
  width: 60px;
  height: 60px;
  bottom: 0;
  right: 10px;
}

.cloud-2 {
  width: 80px;
  height: 50px;
  top: 60px;
  right: 10%;
}

.cloud-2:before {
  width: 60px;
  height: 60px;
  bottom: 0;
  left: 5px;
}

.cloud-2:after {
  width: 50px;
  height: 50px;
  bottom: 0;
  right: 5px;
}

.kawaii-header {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.kawaii-photo-frame {
  position: relative;
  display: inline-block;
}

.kawaii-doodle {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  border: 8px solid var(--kawaii-pink);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Sparkles */
.kawaii-sparkle {
  position: absolute;
  background-color: white;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  animation: sparkle 2s infinite;
}

.sparkle-1 {
  width: 15px;
  height: 15px;
  top: 20px;
  right: 30px;
  animation-delay: 0s;
}

.sparkle-2 {
  width: 20px;
  height: 20px;
  bottom: 30px;
  left: 20px;
  animation-delay: 0.5s;
}

.sparkle-3 {
  width: 18px;
  height: 18px;
  top: 50%;
  right: 10px;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.5) rotate(45deg);
    opacity: 0.7;
  }
}

.kawaii-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.kawaii-card {
  position: relative;
  flex: 1 1 300px;
  background: linear-gradient(
    135deg,
    var(--kawaii-blue) 0%,
    var(--kawaii-purple) 100%
  );
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.kawaii-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.kawaii-card-content {
  position: relative;
  z-index: 2;
}

.kawaii-card-content :deep(h1),
.kawaii-card-content :deep(h2),
.kawaii-card-content :deep(h3),
.kawaii-card-content :deep(h4) {
  color: var(--kawaii-heading);
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.kawaii-card-content :deep(h1) {
  font-size: 1.8rem;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.7);
}

.kawaii-card-content :deep(h2) {
  font-size: 1.5rem;
  border-bottom: 2px dashed var(--kawaii-pink);
  padding-bottom: 5px;
}

.kawaii-card-content :deep(h3) {
  font-size: 1.2rem;
  position: relative;
  display: inline-block;
}

.kawaii-card-content :deep(h3):after {
  content: "✨";
  position: absolute;
  right: -20px;
  opacity: 0.8;
}

.kawaii-card-content :deep(p) {
  margin-bottom: 0.8em;
  font-size: 1rem;
}

.kawaii-card-content :deep(strong) {
  color: var(--kawaii-heading);
  font-weight: 700;
}

.kawaii-card-content :deep(ul) {
  list-style-type: none;
  padding-left: 1.5em;
}

.kawaii-card-content :deep(ul li) {
  position: relative;
  margin-bottom: 0.5em;
}

.kawaii-card-content :deep(ul li):before {
  content: "🌸";
  position: absolute;
  left: -1.5em;
  font-size: 0.9em;
}

.kawaii-card-content a {
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  position: relative;
  z-index: 1;
}

.kawaii-card-content a:hover {
  color: #ff4785;
  text-decoration: none;
}

.kawaii-card-content a:hover:after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 5px;
  background-color: var(--kawaii-yellow);
  z-index: -1;
  border-radius: 3px;
}

.kawaii-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  z-index: 1;
}

.decoration-1 {
  width: 150px;
  height: 150px;
  background-color: var(--kawaii-yellow);
  top: -40px;
  right: -40px;
}

.decoration-2 {
  width: 100px;
  height: 100px;
  background-color: var(--kawaii-mint);
  bottom: -30px;
  left: -30px;
}

/* Heart decorations */
.kawaii-heart {
  position: absolute;
  z-index: 1;
  animation: beat 1.5s ease-in-out infinite;
}

.heart-1 {
  width: 20px;
  height: 20px;
  background-color: var(--kawaii-pink);
  top: 15px;
  left: 20px;
  transform: rotate(-10deg);
  animation-delay: 0.5s;
}

.heart-2 {
  width: 15px;
  height: 15px;
  background-color: var(--kawaii-pink);
  bottom: 20px;
  right: 30px;
  transform: rotate(15deg);
}

.kawaii-heart:before,
.kawaii-heart:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: inherit;
  border-radius: 50%;
}

.kawaii-heart:before {
  top: -50%;
  left: 0;
}

.kawaii-heart:after {
  top: 0;
  right: -50%;
}

@keyframes beat {
  0%,
  100% {
    transform: scale(1) rotate(-10deg);
  }
  50% {
    transform: scale(1.1) rotate(-10deg);
  }
}

.kawaii-footer {
  position: relative;
  height: 80px;
  z-index: 2;
}

.kawaii-star {
  position: absolute;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  animation: twinkle 3s infinite;
}

.star-1 {
  width: 20px;
  height: 20px;
  background-color: var(--kawaii-yellow);
  left: 15%;
  top: 10px;
  animation-delay: 0s;
}

.star-2 {
  width: 30px;
  height: 30px;
  background-color: var(--kawaii-pink);
  left: 50%;
  top: 5px;
  animation-delay: 0.5s;
}

.star-3 {
  width: 25px;
  height: 25px;
  background-color: var(--kawaii-blue);
  left: 80%;
  top: 15px;
  animation-delay: 1s;
}

/* Cute cat */
.kawaii-cat {
  position: absolute;
  bottom: 10px;
  right: 10%;
  width: 50px;
  height: 40px;
}

.cat-ears {
  position: relative;
  width: 100%;
  height: 15px;
}

.ear-left,
.ear-right {
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: var(--kawaii-purple);
  border-radius: 50% 50% 0 0;
}

.ear-left {
  left: 10px;
  transform: rotate(-30deg);
}

.ear-right {
  right: 10px;
  transform: rotate(30deg);
}

.cat-face {
  width: 35px;
  height: 30px;
  background-color: var(--kawaii-purple);
  border-radius: 50%;
  position: relative;
  left: 7px;
}

.cat-eye {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #333;
  border-radius: 50%;
  top: 10px;
}

.cat-eye.left {
  left: 8px;
}

.cat-eye.right {
  right: 8px;
}

.cat-nose {
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: #ff9eb5;
  border-radius: 50%;
  top: 15px;
  left: 15px;
}

.cat-mouth {
  position: absolute;
  width: 8px;
  height: 3px;
  border-radius: 0 0 100% 100%;
  border-bottom: 2px solid #333;
  top: 20px;
  left: 13px;
}

/* Animations */
@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.8);
  }
}

.floating {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bouncing {
  animation: bouncing 5s ease-in-out infinite;
}

@keyframes bouncing {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kawaii-doodle {
    width: 150px;
    height: 150px;
  }

  .kawaii-card {
    flex: 1 1 100%;
  }

  .cloud-1,
  .cloud-2 {
    display: none;
  }
}
</style>
