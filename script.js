const playBtn = document.getElementById("playBtn")
const settingsBtn = document.getElementById("settingsBtn")
const settings = document.getElementById("settings")

const menu = document.getElementById("menu")
const game = document.getElementById("game")

const gameArea = document.getElementById("gameArea")
const input = document.getElementById("typeInput")

const typingSound = new Audio("keyboard.mp3")
const engineSound = new Audio("spaceship.mp3")
let explodeSound = new Audio("explode.mp3")
engineSound.loop = false
engineSound.volume = 0.6

input.addEventListener("input",()=>{

typingSound.currentTime = 0
typingSound.play()

if(typeStartTime === 0){
typeStartTime = Date.now()
}

})

const scoreText = document.getElementById("score")
const timeText = document.getElementById("time")
const accuracyText = document.getElementById("accuracy")

const difficultySelect = document.getElementById("difficulty")
const backBtn = document.getElementById("backBtn")

let score = 0
let time = 0
let difficulty = "easy"

let correct = 0
let wrong = 0

let winScore = 0
let gameEnded = false

let words = []
let asteroids = []

let spawnLoop
let moveLoop
let timerLoop

let asteroidSpeed = 0.3

let typeStartTime = 0

let easyWords = [
"cat","dog","sun","bird","tree","book","home","fish","ball","car",
"moon","star","sky","cloud","rain","wind","river","ocean","mountain","leaf",
"flower","grass","stone","sand","shell","butterfly","bee","ant","spider","horse",
"cow","goat","sheep","pig","duck","chicken","eagle","owl","shark","whale",
"dolphin","turtle","frog","lizard","snake","apple","banana","orange","grape","mango",
"pineapple","watermelon","bread","rice","milk","cheese","egg","sugar","salt","honey",
"chair","table","bed","door","window","clock","phone","computer","keyboard","mouse",
"paper","pen","pencil","bag","shoe","shirt","pants","hat","watch","bottle",
"cup","plate","spoon","fork","knife","lamp","mirror","picture","garden","road",
"bridge","train","bus","plane","boat","ship","bicycle","motorcycle","truck","taxi",
"island","forest","desert","valley","hill","volcano","cave","waterfall","lake","pond",
"storm","thunder","lightning","snow","ice","fire","smoke","shadow","light","energy",
"teacher","student","doctor","nurse","farmer","driver","pilot","chef","artist","writer",
"actor","singer","dancer","builder","engineer","scientist","police","soldier","judge","lawyer",
"baby","child","teen","adult","parent","family","friend","neighbor","guest","leader",
"king","queen","prince","princess","hero","villain","giant","dragon","wizard","knight",
"castle","tower","village","city","country","nation","market","shop","store","factory",
"office","school","library","hospital","station","airport","harbor","garage","park","stadium"
]

let normalWords = [
"community","computer","science","keyboard","internet","library","programming","javascript"
]

let hardWords = [
"responsibility","communication","extraordinary","characteristic","internationalization"
]

settingsBtn.onclick = () => {

settings.style.display =
settings.style.display === "block" ? "none" : "block"

}

playBtn.onclick = () => {
game.style.display = "block"

let ship = document.getElementById("ship")

ship.classList.add("show")

engineSound.currentTime = 0
engineSound.play()

input.focus()


difficulty = difficultySelect.value

if(difficulty === "easy"){
words = easyWords
time = 120
asteroidSpeed = 0.5
winScore = 400
}

if(difficulty === "normal"){
words = normalWords
time = 60
asteroidSpeed = 0.5
winScore = 800
}

if(difficulty === "hard"){
words = hardWords
time = 30
asteroidSpeed = 0.7
winScore = 1000
}

timeText.innerText = time

menu.style.display = "none"
game.style.display = "block"

engineSound.currentTime = 0
engineSound.play()

input.focus()

startGame()

}
backBtn.onclick = () => {

clearInterval(spawnLoop)
clearInterval(moveLoop)
clearInterval(timerLoop)

asteroids.forEach(a => a.remove())
asteroids = []

game.style.display = "none"
menu.style.display = "block"

score = 0
correct = 0
wrong = 0


scoreText.innerText = 0
accuracyText.innerText = 100
timeText.innerText = 0

input.value = ""

}

/* SPAWN ASTEROID (FIX PARA HINDI MAG STOCK SA EASY) */

function spawnAsteroid(){

let maxAsteroids = 6

if(difficulty === "easy") maxAsteroids = 4
if(difficulty === "normal") maxAsteroids = 6
if(difficulty === "hard") maxAsteroids = 8

if(asteroids.length >= maxAsteroids){
return
}

let word = words[Math.floor(Math.random()*words.length)]

let div = document.createElement("div")
div.className = "asteroid"

div.innerHTML =
"<img src='asteroid.png' class='asteroidImg'><div class='word'>"+word+"</div>"

div.dataset.word = word

let center = gameArea.offsetWidth / 2
let randomOffset = (Math.random()*160) - 80

div.style.left = (center + randomOffset) + "px"
div.style.top = "0px"

gameArea.appendChild(div)

asteroids.push(div)

}

function moveAsteroids(){

asteroids.forEach((a,index)=>{

let top = a.offsetTop
let drift = Math.sin(top/40)*1.5

a.style.top = top + asteroidSpeed + "px"
a.style.left = (a.offsetLeft + drift) + "px"

if(top > 520){

    if(gameArea.contains(a)){

        explodeSound.currentTime = 0
        explodeSound.play()

        gameArea.removeChild(a)
    }

    asteroids.splice(index,1)

    wrong++
    updateAccuracy()

if(difficulty === "easy") time -= 3
if(difficulty === "normal") time -= 5
if(difficulty === "hard") time -= 7

timeText.innerText = time

}

})

}

function shoot(target){

let bullet = document.createElement("div")
bullet.className = "laser"

let ship = document.getElementById("ship")

bullet.style.left = ship.offsetLeft + 25 + "px"
bullet.style.top = ship.offsetTop + "px"

gameArea.appendChild(bullet)

let move = setInterval(()=>{

let bulletX = bullet.offsetLeft
let bulletY = bullet.offsetTop

let targetX = target.offsetLeft
let targetY = target.offsetTop

let dx = targetX - bulletX
let dy = targetY - bulletY

let dist = Math.sqrt(dx*dx + dy*dy)

/* move toward target */
bullet.style.left = bulletX + (dx/dist)*8 + "px"
bullet.style.top = bulletY + (dy/dist)*8 + "px"

/* hit detection */
if(dist < 25){

clearInterval(move)

explodeSound.currentTime = 0
explodeSound.play()

createExplosion(target.offsetLeft,target.offsetTop)
shakeScreen()

if(gameArea.contains(target)){
gameArea.removeChild(target)
}

if(gameArea.contains(bullet)){
gameArea.removeChild(bullet)
}

asteroids = asteroids.filter(a => a !== target)

score += 10
scoreText.innerText = score

if (score >= winScore && !gameEnded){
gameEnded = true
winGame()
}

}

},20)

}

function createExplosion(x,y){

let boom = document.createElement("div")
boom.className = "explosion"

boom.style.left = x+"px"
boom.style.top = y+"px"

gameArea.appendChild(boom)

setTimeout(()=>{
if(gameArea.contains(boom)){
gameArea.removeChild(boom)
}
},400)

}

function shakeScreen(){

gameArea.classList.add("shake")

setTimeout(()=>{
gameArea.classList.remove("shake")
},300)

}

input.addEventListener("input",()=>{ typingSound.currentTime = 0
typingSound.play()

if(typeStartTime === 0){
typeStartTime = Date.now()
}

})

input.addEventListener("keydown",(e)=>{

if(e.key === "Enter"){

let typeEndTime = Date.now()
let typeSpeed = (typeEndTime - typeStartTime) / 1000

let typed = input.value.toLowerCase()

let hit = false

asteroids.forEach((a)=>{

if(a.dataset.word === typed && a.offsetTop>0){

hit = true

correct++
updateAccuracy()

shoot(a)

if(typeSpeed >= 1 && typeSpeed < 2){
time += 6
}

else if(typeSpeed >= 2 && typeSpeed < 3){
time += 3
}

timeText.innerText = time

}

})

if(!hit){

wrong++
updateAccuracy()

}

input.value = "";
typeStartTime = 0;

}

})

function updateAccuracy(){

let total = correct + wrong

if(total === 0){
accuracyText.innerText = 100
return
}

let accuracy = Math.floor((correct / total) * 100)

accuracyText.innerText = accuracy

}

function startTimer(){

timerLoop = setInterval(()=>{

time--
timeText.innerText = time

if(time <= 0){
endGame()
}

},1000)

}

function endGame(){

clearInterval(spawnLoop)
clearInterval(moveLoop)
clearInterval(timerLoop)

alert("Game Over")

}

function startGame(){

let spawnRate = 2000

if(difficulty === "easy") spawnRate = 2400
if(difficulty === "normal") spawnRate = 2000
if(difficulty === "hard") spawnRate = 1700

spawnLoop = setInterval(spawnAsteroid,2000)
moveLoop = setInterval(moveAsteroids,40)

startTimer()

}
function endGame(){

if(gameEnded) return
gameEnded = true

clearInterval(spawnLoop)
clearInterval(moveLoop)
clearInterval(timerLoop)

engineSound.pause()

input.style.display = "none"

gameArea.innerHTML = `
<div class="gameOver">
<div class="gameOverBox">

<h2 class="loseTitle">YOU LOSE</h2>

<div class="loadingStats">
Loading results...
</div>

<div class="stats" style="display:none">

<div class="stat">
<p>SCORE</p>
<h3 id="finalScore">0</h3>
</div>

<div class="stat">
<p>ACCURACY</p>
<h3 id="finalAccuracy">0%</h3>
</div>

</div>

<div class="buttons">

<button id="exitGame" class="menuBtn">EXIT</button>

</div>

</div>
</div>
`

// loading effect
setTimeout(()=>{

document.querySelector(".loadingStats").style.display="none"
document.querySelector(".stats").style.display="flex"

document.getElementById("finalScore").innerText = score
document.getElementById("finalAccuracy").innerText = accuracyText.innerText + "%"

},1500)

document.getElementById("exitGame").onclick = ()=>{
location.reload()
}


}function restartGame(){

asteroids = []
score = 0
time = 60

gameArea.innerHTML = `
<div class="stars"></div>

<div id="ship">
<img src="spaceship.png" id="shipImg">
</div>
`

scoreText.innerText = "0"
timeText.innerText = "60"

input.style.display = "block"
input.value = ""
input.focus()

startGame()

} 



function winGame(){

clearInterval(spawnLoop)
clearInterval(moveLoop)
clearInterval(timerLoop)

engineSound.pause()

input.style.display = "none"

gameArea.innerHTML = `
<div class="gameOver">
<div class="gameOverBox">

<h2 class="loseTitle" style="color:cyan;">YOU WIN</h2>

<div class="stats">

<div class="stat">
<p>SCORE</p>
<h3>${score}</h3>
</div>

<div class="stat">
<p>ACCURACY</p>
<h3>${accuracyText.innerText}%</h3>
</div>

</div>

<div class="buttons">
<button onclick="location.reload()" class="menuBtn">PLAY AGAIN</button>
</div>

</div>
</div>
`

}