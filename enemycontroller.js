import Enemy from "./enemy.js";

import MovingDirection from "./MovingDirection.js";

export default class enemycontroller {
/* creating an array of enemies */
    enemyMap = [
        [1, 1, 3, 3, 2, 3, 3, 3, 2, 3, 3, 1, 1],
        [1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1],
        [1, 1, 3, 3, 2, 2, 2, 2, 2, 3, 3, 1, 1],
        [1, 1, 3, 2, 2, 3, 2, 3, 2, 2, 3, 1, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
        [1, 3, 2, 3, 2, 2, 2, 2, 2, 3, 2, 3, 1],
        [1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1],
        [1, 1, 3, 3, 2, 3, 3, 3, 2, 3, 3, 1, 1],
        [0, 0, 0, 3, 3, 0, 0, 0, 3, 3, 0, 0, 0],
    ];
    enemyRows = [];

    currentDircetion = MovingDirection.right;
    xVelocity = 0;
    yVelocity = 0;
    deafaultxVelocity = 1;
    deafaultyVelocity = 1;
    moveDownTimerDefault = 30;
    moveDownTimer = this.moveDownTimerDefault;
    fireBulletTimerDefault = 100;
    fireBulletTimer = this.fireBulletTimerDefault;

    constructor(canvas, enemyBulletController, playerBulletController){
        this.canvas = canvas;
        this.enemyBulletController = enemyBulletController;
        this.playerBulletController = playerBulletController;
        this.enemyDeathSound = new Audio('sounds/enemy-death.wav');
        this.enemyDeathSound.volume = 0.01;


        this.creatEnemies();
    }

    draw(ctx) {
        this.decrementMoveDownTimer();
        this.updateVelocityAndDirection();
        this.collisionDetection();
        this.drawEnemies(ctx);
        this.resetMoveDownTimer();
        this.fireBullet();
    }

    collisionDetection() {
        this.enemyRows.forEach(enemyRow => {
            enemyRow.forEach((enemy, enemyIndex)=> {
                if (this.playerBulletController.collideWith(enemy)) {
                    this.enemyDeathSound.currentTime = 0;
                    this.enemyDeathSound.play();
                    enemyRow.splice(enemyIndex, 1);
                }
            })
        })

        this.enemyRows = this.enemyRows.filter(enemyRow => enemyRow.length > 0);
    }

    fireBullet() {
        this.fireBulletTimer--;
        if (this.fireBulletTimer <= 0){
            this.fireBulletTimer = this.fireBulletTimerDefault;
            const allEnemies = this.enemyRows.flat();
            const enemyIndex = Math.floor(Math.random() * allEnemies.length);
            const enemy = allEnemies[enemyIndex];
            this.enemyBulletController.shoot(enemy.x, enemy.y, -3);
            console.log(enemyIndex);
        }
    }

    resetMoveDownTimer() {
        if (this.moveDownTimer <= 0) {
            this.moveDownTimer = this.moveDownTimerDefault;
        }
    }

    decrementMoveDownTimer(){
        if (this.currentDircetion === MovingDirection.downleft ||
            this.currentDircetion === MovingDirection.downright) {
                this.moveDownTimer --;
            }

    }
    updateVelocityAndDirection() {
        for(const enemyRow of this.enemyRows) {
            if (this.currentDircetion == MovingDirection.right) {
                this.xVelocity = this.deafaultxVelocity;
                this.yVelocity = 0;
                const rightMostEnemy = enemyRow[enemyRow.length - 1];
                if (rightMostEnemy.x +rightMostEnemy.width >= this.canvas.width) {
                    this.currentDircetion = MovingDirection.downleft;
                    break;
                }
            }
            else if (this.currentDircetion === MovingDirection.downleft) {
                if (this.moveDown(MovingDirection.left)) {
                    break;
                }
            } else if (this.currentDircetion === MovingDirection.left) {
                this.xVelocity = -this.deafaultxVelocity;
                this.yVelocity = 0
                const leftMostEnemy = enemyRow[0];
                if (leftMostEnemy.x <= 0) {
                    this.currentDircetion = MovingDirection.downright;
                    break;
                }
            } else if (this.currentDircetion === MovingDirection.downright) {
                if (this.moveDown(MovingDirection.right)) {
                    break;
                }
            }
        }
    }

    moveDown(newDirection) {
        this.xVelocity = 0;
        this.yVelocity = this.deafaultyVelocity;
        if (this.moveDownTimer <= 0) {
            this.currentDircetion = newDirection;
            return true;
        }
        return false;
    }

    drawEnemies(ctx){
        this.enemyRows.flat().forEach((enemy) => {
            enemy.move(this.xVelocity, this.yVelocity);
            enemy.draw(ctx);
        });
    }

    creatEnemies() {
        this.enemyMap.forEach((row,rowIndex) => {
            this.enemyRows[rowIndex] = [];
            row.forEach((enemyNumber,enemyIndex) => {
                if(enemyNumber > 0) {
                    this.enemyRows[rowIndex].push(new Enemy(enemyIndex * 50, rowIndex * 35, enemyNumber))
                }
            });
        });

    }

    collideWith (sprite) {
        return this.enemyRows.flat().some ((enemy) => enemy.collideWith(sprite));
    }
}