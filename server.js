// ***** Toutes les variables contenant les modules dont on a besoin 
const express = require ('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const  { Timer }  =  require ( 'timer-node' )
const minuteur = new Timer({ label: 'monMinuteur' });
var startGame = false
// *************** Définition des termes du jeu *************   
    // Ici on définit les deux fonctions qui nous permettront d'afficher les photos aléatoirement (17 photos en tout définies côté client)
var getRandomIndex = function(){
return Math.floor(Math.random() * 17)
                                }
    // On enregistre la fonction de random des photos dans une var
var questionImage = getRandomIndex()
// Tableau qui contiendra tous les joueurs
let joueurs = []
//***** Port d'écoute de notre serveur 
const PORT = process.env.PORT || 5000;
// gestion de connexion mongoclient . require npm install mongo-client
const MongoClient = require('mongodb').MongoClient;
// valeurs a changer : mettre url du client mongo et le nom de la database
const url = 'mongodb+srv://Amina:W12fsINOhnBWWb1j@cluster0.yw2yr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
//nom de la database et de la collection
const database = 'multiGame'
const myCollection = 'joueurs'
// Ici pour chaque carte,je définis une réponse dans le tableau pour vérifier que la réponse du joueur est OK
let answers = new Array('Je tape sur la table', 'Je tape sur la table','Je tape sur la table', 'Je tape sur la table', 'Carte Classique', 'Carte Classique', 'Bonjour Madame', 'Bonjour Madame', 'Bonjour Madame', 'Bonjour Monsieur', 'Bonjour Monsieur', 'Carte Classique', 'Révérence au roi', 'Révérence au roi', 'Carte Classique', 'Carte Classique', 'Carte Classique', 'Carte Classique')

// **********************************************************************

// ****************** Serveur et BDD *****************************
app.set('view engine','pug'); 
// Interpréter le body de la requête POST
app.use(express.urlencoded({
	extended: false
}));
// Enregistrer les sessions 
const session = require('express-session')

app.use(session({
	secret:'test',
	resave: false,
	saveUninitialized: true
}));


var userSession;

// ***** Toutes les requêtes pour les fichiers statiques(fichier de front-end/CSS/images....)
app.use('/css',express.static(__dirname + '/assets/css'));
app.use('/js',express.static(__dirname + '/assets/js'));
app.use('/src',express.static(__dirname + '/src'));
app.use('/img',express.static(__dirname + '/static/img'));

// *** Gestion des pages et des routes 
    // Index
app.get(['/','/index'], (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err,client) => {
    const coll = client.db(database).collection(myCollection);
    coll.find({score : { $eq : 16} }).sort({dureeJeu: 1}).toArray((err,datas) => {

    res.render('index', {title : 'The morocan Sota Game', leaderBoard : datas})
                })
    })

})




// **********************************************************************
// ************** Inscription d'un nouvel utilisateur *********************
//***********************************************************************/

app.get('/signpage', (req, res) => {
userSession = req.session

MongoClient.connect(url, { useUnifiedTopology: true }, (err,client) => {
    const coll = client.db(database).collection(myCollection);
    coll.find().toArray((err,datas) => {
    
if(userSession.user){
    res.render('game', {title : 'The morrocan Sota Game' })

}else{
    res.render('signIn', {title : 'The morrocan Sota Game' })
}

})
    })
        })

// **************************** Post pour inscription *****************

// La requête envoyée suite au remplissage du formulaire d'inscription est envoyée en post et renvoie des réponses vers des HTML existants selon le cas de figure 
app.post('/inscription',(req,res,next) => {
	userSession = req.session
	MongoClient.connect(url, { useUnifiedTopology : true }, (error,client)=>{
	const coll = client.db("multiGame").collection("joueurs");
		// recherche dans la database de la correspondance de l'entree utilisateur
    coll.find({'pseudonyme' : req.body.pseudonyme}).toArray((err,data)=>{

    const coordonnees = {
            pseudonyme: req.body.pseudonyme,
            score: 0,
            avatar : req.body.avatar,
            dureeJeu : 0,
            
    }
            
    if(data.length===0){
        // si pas de correspondance, creation d'un user  et insertion dans la DBs

    coll.insertOne(coordonnees, (error,record) => {
    res.render('game')

    // Appel de socket.io côté serveur
    io.once('connect', function(socket){                   
    // Récupérer le nom de la personne qui s'est connectée pour afficher à l'entrée du jeu.
    socket.emit('user_joined', (coordonnees))                          
    let joueur = {
    id: socket.id,
    name : coordonnees.pseudonyme,
    Avatar : coordonnees.avatar,
    scoreParties : coordonnees.score,
    dureeJeu : coordonnees.dureeJeu

    }
                    
    // Je rajoute le joueur qui s'est connecté au tableau joueurs 
    // console.log('je suis le nouveau joueur', joueur)
    joueurs.push(joueur)
    console.log('joueur', joueur)

    maj()


    socket.on('counter', (getCounter) =>{
        const time = minuteur.time();
        io.emit('time', {time: time, startGame: startGame})
    })

                                                                        
    // ******** Réception du client de la réponse de chaque joueur ************
    socket.on('user_response', (value)=> {
    if (value == answers[questionImage]){
        let socketID = socket.id
        scoring(socketID)
        maj()
        
    }
    })
    // ****************************************************

    function scoring(id){
    joueurs.map(player => {
    if (player.id === id){
        player.scoreParties += 1
            }
        })
    }


    // ***********************************
    function maj(){
        questionImage = getRandomIndex()
        io.emit('send_question', questionImage)
        // Quand l'utilisateur rejoint la partie => on lui affiche le joueur adverse et son score.
        io.emit('TableauScore', joueurs)
        if(joueurs.length >1){
            minuteur.start();
            startGame = true; 
        }

        }
    // *****************Récup score Final ****************

    socket.on('scoreFinal', (score)=> {
    minuteur.stop()
    const tempsDeJeu = minuteur.format('[%m] minutes [%s] seconds [%ms]ms')
    MongoClient.connect(url, { useUnifiedTopology:true }, (error,client)=>{
    const collection = client.db(database).collection(myCollection)
    score.map(player => {
    if (player.id === socket.id){
    collection.updateMany(
        {'pseudonyme' : player.name},
        {$set: {"score": player.scoreParties, "dureeJeu" : tempsDeJeu}},
        )   
            }})
                })
            })
                                                                                
                                                                                
    //    Nous écoutons l'évenment disconnect (qui se matérialise par la disparition de la socket : quitter la page ou autre)
    socket.on('disconnect', function(){
    // Quand un joueur se déconnecte, il faut le dégager du tableau de joueurs enregistrés
    joueurs = [...joueurs.filter(function(player){
    // on filtre le tableau : Ici socket.id correspond au joueur qui s'est déconnecté. Donc nous on veut récuperer tous les id des joueurs toujours connectés, c'est pour cela que l'on a besoin que le player.id soit différent du socket.id
    return player.id !== socket.id})] 
                                    })

    })
    
    })
    // ensuite renvoi vers la page d'authentification pour qu'il se connecte avec ses identifiants et mdp nouvelement créés
    }else{
    // Si utilisateur existe déjà avec l'id , alors on le renvoie vers la page d'authentification pour qu'il se connecte
    res.render('signIn', {title : 'The morrocan Sota Game', Erreur : 'Attention, votre identifiant existe déjà dans notre BDD. Veuillez en choisir un autre'})
    }
// ***Fin requête dans la BDD 
})
// ***Fin connection dans la BDD 
})

// ********* Fin du app.post envoyé par le formulaire d'inscription
})

// ***Connexion au port serveur 
server.listen(PORT, function(){
        console.log(`Vous êtes connecté au serveur sur le port ${PORT}`)
    })