// Définition de toutes les varaibles 
        // *** Variables Game.pug** 
            // *** Menu** 
                let menu = document.getElementById('menu')
            //Waiting List
                let waitingList = document.getElementById('waitingList')
            // *** Affichage Client - Jeu **
            let commencer = document.getElementById('commencer')
            let bienvenue = document.getElementById('bienvenue')
            let image = document.getElementById('myPicture')
            let reponseJoueur = document.getElementById('reponse')
            let submissionForm = document.getElementById('submission')
            // Tableau de score
            let tableBoard = document.getElementById('scoring')
            let divScore = document.getElementById('divScore')
            let gagnant = document.getElementById('gagnant')
            let rejouer =document.getElementById('rejouer')
            let entree = document.getElementById('entree')
            let count = document.getElementById('count')
    // *** Image Cartes à ajouter **
            let myImageCards = new Array('../img/cards/asBaton.jpg', '../img/cards/asJbaben.jpeg','../img/cards/asOr.jpg', '../img/cards/asSabre.jpg', '../img/cards/deuxJbaben.jpg', '../img/cards/deuxOr.jpg', '../img/cards/mmeBaton.jpg', '../img/cards/mmeJbaben.jpg', '../img/cards/mmeOr.jpg', '../img/cards/mrJbaben.jpg', '../img/cards/mrSabre.jpeg', '../img/cards/quatreSabre.jpg', '../img/cards/roiJbaben.jpg', '../img/cards/roiOr.jpg', '../img/cards/septJbaben.jpg', '../img/cards/sixBaton.jpg', '../img/cards/sixOr.jpg', '../img/cards/sixSabre.jpg')

 // *** Définition Socket **
        let socket = undefined;

 // *** Script Jeu  **
     // *** A l'arrivée de la page, tant qu'il y a un joueur on cache le jeu  **
    window.onload = function(){
    entree.style.display ='none'
    divScore.style.display ='none'
    rejouer.style.display ='none'
    submissionForm.style.display ='none'
    menu.style.display ='none'
    }

    // *** Principale fonction pour lancer le jeu. Au clic sur Bouton Commencer  **
    commencer.addEventListener('click', function(e){
    // *** Début Fonction Jeu **
    e.preventDefault()
    socket = window.io();
    // *** Ecoute du serveur dès que quelqu'un se connecte  **
    socket.on('user_joined', (coordonnees)=> {
    commencerLejeu(coordonnees.pseudonyme)
                                            })

    // *** Fonction/CONST qui gèrent la durée du jeu  **
     // *** Définition FCT et CONST **
    function countingTime() {
    socket.emit('counter', 'getCounter')
                            }
    // ***************************************                       
    const tempsJeu = setInterval(function(){countingTime()}, 1000);

    // *** Déclaration Fonction pour commencer le jeu (plus haut dans le socket)  **
    function commencerLejeu(pseudo){
        menu.style.display ='block'
        entree.style.display ='block'
        // *** On reçoit la question de la part du serveur  **
        socket.on('send_question', (question) => {
        image.src =  myImageCards[question]
                                                })
        // *** On récupère le pseudo du socket connecté  **
        bienvenue.innerText=`Bienvenue ${pseudo}`

        socket.on('TableauScore', (players)=>{
        if(players.length <= 1) {
        // *** On attend l'arrivée d'un deuxième joueur au moins **
        waitingList.innerText="En attente d'un ou plusieurs adversaires"
        commencer.style.display="none";

        }else {
        // *** On commence le jeu à partir de 2 joueurs **
        commencer.style.display="none";
        waitingList.innerText="Jouez!";
        divScore.style.display ='block';
        submissionForm.style.display ='block';


        // *** On écoute le compte à rebours venant du serveur **
        socket.on('time',(timeS) =>{
        if(timeS.startGame==true){
        count.innerText = "Durée du jeu : " + timeS.time.m  + " " + "min : " + timeS.time.s + " " + "s"
        }else{
            count.innerText= "Durée du jeu :  " + 0
        }                        })

        // *** Ici, on map dans le tableau des joueurs, pour pouvoir récupérer l'avatar choisi et faire le lien en local avec l'image et l'afficher avec le score **
        players.map(player=> {
        switch(player.Avatar){
        case 'image1' :
        player.Avatar ="./img/avatars/The_death.png" 
        break;

        case 'image2' :
        player.Avatar ="./img/avatars/tete.png" 
        break;

        case 'image3' :
        player.Avatar ="./img/avatars/smiley.png" 
        break;

        case 'image4' :
        player.Avatar="./img/avatars/laptop.png" 
        break;

        case 'image5' :
        player.Avatar="./img/avatars/guimauve.jpg" 
        break;

        case 'image6' :
        player.Avatar ="./img/avatars/eponge.png" 
        break;

        case 'image7' :
        player.Avatar="./img/avatars/bouche.png"  
        break;

        case 'image8' :
        player.Avatar="./img/avatars/babyboss.jpg" 
        break;

        default :
        console.log('pas d\'avatar');
                    } 
                })
                
            
        tableBoard.innerHTML=`
        ${players.map(player => 

        `<li> <strong> Name :</strong> ${player.name} -  <strong> Points :</strong> ${player.scoreParties} -  <strong> Mon avatar :</strong><img src = ${player.Avatar} class="avatarServ"> </li> `).join(' ')}`
        
        tableBoard.style.listStyle ="none"
        
        // *** Ici, on map dans le tableau des joueurs, pour pouvoir récupérer le score final et l'envoyer au serveur pour l'enregistrer et rediriger le joueur **
        players.map(player => {
        if(player.scoreParties == 16){
            rejouer.style.display ='inline'
            gagnant.innerHTML = `Fin de partie. Bravo <strong>${player.name}</strong>, vous remportez la partie avec ${player.scoreParties} points.<br>
            Je vous redirige vers la page d'inscription, si vous voulez rejouer!`
            entree.style.display ='none';
            submissionForm.style.display='none'
            socket.emit('scoreFinal', (players))

            setTimeout(function(){
                document.location.reload()
            }, 5000) }   
                            })
        // *** Fin de la condition else pour socket.on(Tableau...) **
            }
// *** Fin de  socket.on(Tableau...) **
    })
// *** Fin de la déclaration commencerleJeu**
        }

// *** Envoi de la réponse du joueur au serveur et renvoi d'une nouvelle question  **
submissionForm.addEventListener('submit',function(e){
e.preventDefault();
let value =  e.target['reponse'].value
if (value){
    console.log(value)
    socket.emit('user_response', value)
    submission.reset();

}
socket.on('send_question', (question) => {
    image.src =  myImageCards[question]
} )

})

// *** Fin du addEventListener **
})










    // // *************** FIN ********************


