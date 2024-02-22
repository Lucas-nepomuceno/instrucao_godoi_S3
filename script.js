//define a função de replay do jogo
    const replay = () => {
        window.location.reload();
    }
//define a variavel config que terá como propriedades, as configurações da tela do jogo
var config = {
    //permite o phaser escolha o renderizador apropriado
    type: Phaser.AUTO,
    //propriedade que dá a largura da tela
    width: 800,
    //propriedade que dá a altura da tela
    height: 600,
    //propriedade que permite adicionar física mais profunda no jogo
    physics: {
        //define que a física do jogo se baseará no tipo de gráfico arcade, o qual é mais simples
        default: 'arcade',
        //define as propriedades do arcade
        arcade: {
            //define a aceleração com a qual elementos afetados pelo physics vão cair
            gravity: { y: 300 },
            //deixa a linha de velocidade e as bordas dos elementos afetados pelo physics transparente
            debug: false
        }
    },
    //define as propriedades da cena do jogo (PADRÃO DO PHASER), para que as funções preload, create e update funcionem
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
//grupo de variáveis relevantes no jogo que armazenaração posição e caracteristicas dos elementos
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

//cria uma instância do jogo com as configurações definidas em config
var game = new Phaser.Game(config);

//função que carrega os elementos do jogo para que possam ser usadas posteriormente
function preload ()
{
    //carrega o céu do cenário
    this.load.image('sky', 'assets/sky.png');
    //carrega o chão do cenário
    this.load.image('ground', 'assets/platform.png');
    //carrega a estrela do cenário
    this.load.image('star', 'assets/star.png');
    //carrega a bomba
    this.load.image('bomb', 'assets/bomb.png');
    //carrega a coleção de imagens do 'cara', definindo a largura e a altura do frame
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

//função que adiciona os elementos pré-carregados em preload e caracteristicas dos elementos
function create ()
{
    //adiciona o background do jogo
    this.add.image(400, 300, 'sky');

    //cria o grupo estático plataformas que terá seus elementos definidos depois
    platforms = this.physics.add.staticGroup();

    //cria o chão dentro do grupo platforms, com uma escala 2, a função refreshBody linka a posição do chao à plataforms
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //criação de outros 'pedaços' de chão um pouco menores e em outras posições
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    //adiciona o personagem 'dude'/'cara' na posição 100x450
    player = this.physics.add.sprite(100, 450, 'dude');

    //o cara guarda 0.2 da sua energia anterior ao colidir com um objeto, fazendo-o quicar
    player.setBounce(0.2);
    //define que o cara não pode passar da tela
    player.setCollideWorldBounds(true);

    //cria uma animação para o movimento de andar para a esquerda
    this.anims.create({
        //id da animação
        key: 'left',
        //define quais frames serão usados na animação(0 à 3)
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        //define a taxa de frames por segundo em 10
        frameRate: 10,
        //repete pra sempre
        repeat: -1
    });
    //cria a animação para o movimento de virar
    this.anims.create({
        //id da animação
        key: 'turn',
        //define quais frames serão usados (4)
        frames: [ { key: 'dude', frame: 4 } ],
        //define a taxa de frames por segundo em 20
        frameRate: 20
    });
    
    //cria uma animação para o movimento de andar para a direita
    this.anims.create({
        //id da animação
        key: 'right',
        //define quais frames serão usados (5 à 8)
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        //define a taxa de frames por segundo em 10
        frameRate: 10,
        //repete para sempre
        repeat: -1
    });

    //armazena na variavel 'cursors' o reconhecimento das setas
    cursors = this.input.keyboard.createCursorKeys();

    //adiciona o grupo de estrelas
    stars = this.physics.add.group({
        //id das estrelas
        key: 'star',
        //repetição da imagem das estrelas na tela
        repeat: 11,
        //set up da posição das estrelas, sendo x e y inicial e o x tem um step pra cada repetição
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    //os filhos da estrela da seguinte forma...
    stars.children.iterate(function (child) {

        //bounce randomizado pra cada filho  
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    //cria o grupo de bombas
    bombs = this.physics.add.group();

    //cria o score com posiçãox, y, texto e style definidas
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //colisões entre os 'personagens' e as plataformas
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //  Checks to see if the player collides with the bombs, if he does call the collectStar function
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}
//função que repete atualizando o jogo
function update ()
{
    //se boolean gameOver é verdadeiro
    if (gameOver)
    {
        //quando o tempo expirar...
        setTimeout(() => {
            //variaveis que armazenam o gameover-max-div e o score
            let scoreDiv = document.getElementById('gameover-max-div');
            let scoreSpan = document.getElementById('score');

            //mostra o score e a seta div que o contém como block
            scoreSpan.textContent = score;
            scoreDiv.style.display = 'block';

        }, 1500);

        return;
    }
    //se a seta pra esquerda pressionada
    if (cursors.left.isDown)
    {
        //player vai para a esquerda
        player.setVelocityX(-160);
        //a animação da esquerda é ativada
        player.anims.play('left', true);
    }
    //se a seta pra direita pressionada
    else if (cursors.right.isDown)
    {
        //player vai para direita
        player.setVelocityX(160);
        //animação da direita toca
        player.anims.play('right', true);
    }
    //se nenhuma das duas está pressionada
    else
    {
        //o player não se move
        player.setVelocityX(0);
        //animação de rodar é tocada
        player.anims.play('turn');
    }
    //se a tecla para cima está pressionada e o player está na parte de baixo
    if (cursors.up.isDown && player.body.touching.down)
    {
        //personagem vai para cima (pulo)
        player.setVelocityY(-330);
    }
}
//função coletar estrela que tem como parametros o player e a estrela
function collectStar (player, star)
{
    //como o destroi, mas esse só desativa --> (desativar?, sumir com ele?)
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    //define aquele texto do score lá em cima com concatenação
    scoreText.setText('Score: ' + score);

    //se o contador de ativos da estrela for 0
    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {
            //volta a ser funcional (reset?, x, y, ligar e aparecer)
            child.enableBody(true, child.x, 0, true, true);

        });
        //x armazena como se segue: se a posição horizontal do player for menor que 4, um numero entre 400 e 800, se não, entre 0 e 400
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        
        //cria uma bomba com o x randomizado e a altura 16
        var bomb = bombs.create(x, 16, 'bomb');
        //propriedades das bombas
        //pula-pula
        bomb.setBounce(1);
        //colide com as boardas
        bomb.setCollideWorldBounds(true);
        //velocidade x randomizada, mas y é 20
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        //tira a gravidade da bomba
        bomb.allowGravity = false;

    }
}
//função bateu na bomba
function hitBomb (player, bomb, score)
{
    //pausa toda fisica do jogo
    this.physics.pause();
    //cor da tinta a ser aplicada, vermelho
    player.setTint(0xff0000);
    //o personagem vira
    player.anims.play('turn');
    //gameOver se torna verdadeiro
    gameOver = true;

}
