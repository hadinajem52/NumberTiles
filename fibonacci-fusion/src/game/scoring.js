// This file manages the scoring system, including calculating scores based on merges and tracking bonus points.

class Scoring {
    constructor() {
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.bonusPoints = 0;
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboTimeout = 1500; // 1.5 seconds to maintain combo
        this.mergeChain = 0;
        this.gameMode = 'classic';
        this.achievements = {};
        this.milestones = [
          { value: 500, reached: false, reward: 100 },
          { value: 1000, reached: false, reward: 200 },
          { value: 2048, reached: false, reward: 400 },
          { value: 4096, reached: false, reward: 800 },
          { value: 8192, reached: false, reward: 1600 }
        ];
    }

    addScore(points, mergedValue) {
        // In 2048, score is typically the merged value itself
        let earnedPoints = points;
        
        // Add combo multiplier if active
        if (this.comboCount > 0) {
            const comboMultiplier = Math.min(1 + (this.comboCount * 0.1), 2);
            earnedPoints = Math.floor(earnedPoints * comboMultiplier);
        }
        
        // Add merge chain bonus (consecutive merges in one move)
        if (this.mergeChain > 1) {
            earnedPoints += Math.floor(earnedPoints * (this.mergeChain * 0.15));
        }
        
        // Add bonus for high-value tiles (larger than 512)
        if (mergedValue >= 512) {
            earnedPoints += this.calculateHighValueBonus(mergedValue);
        }

        // Increase score
        this.score += earnedPoints;
        
        // Increment combo counter
        this.incrementCombo();
        
        // Check for milestones
        this.checkMilestones();
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        return earnedPoints;
    }
    
    incrementCombo() {
        // Clear existing combo timer if present
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        // Increment combo counter
        this.comboCount++;
        
        // Set timer to reset combo if no new merges happen soon
        this.comboTimer = setTimeout(() => {
            this.comboCount = 0;
        }, this.comboTimeout);
    }
    
    startMergeChain() {
        this.mergeChain = 0;
    }
    
    addToMergeChain() {
        this.mergeChain++;
        return this.mergeChain;
    }
    
    endMergeChain() {
        const finalChain = this.mergeChain;
        this.mergeChain = 0;
        return finalChain;
    }
    
    calculateHighValueBonus(tileValue) {
        // Bonuses for large tile values
        if (tileValue >= 8192) return tileValue * 2;
        if (tileValue >= 4096) return tileValue * 1.5;
        if (tileValue >= 2048) return tileValue * 1.2;
        if (tileValue >= 1024) return tileValue * 1.1;
        return tileValue * 0.5;
    }

    checkMilestones() {
        this.milestones.forEach(milestone => {
            if (!milestone.reached && this.score >= milestone.value) {
                this.bonusPoints += milestone.reward;
                milestone.reached = true;
                this.triggerMilestoneAchievement(milestone);
            }
        });
    }
    
    triggerMilestoneAchievement(milestone) {
        // Could be used to send events to an achievement system
        const achievementId = `score_${milestone.value}`;
        this.achievements[achievementId] = {
            achieved: true,
            timestamp: Date.now()
        };
    }

    trackAchievement(id, data = {}) {
        this.achievements[id] = {
            ...data,
            achieved: true,
            timestamp: Date.now()
        };
    }

    getGameModeMultiplier() {
        return 1.0; // Only classic mode remains
    }

    resetScore() {
        this.score = 0;
        this.bonusPoints = 0;
        this.comboCount = 0;
        this.mergeChain = 0;
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
        
        // Reset milestones
        this.milestones.forEach(milestone => {
            milestone.reached = false;
        });
    }

    setGameMode(mode) {
        this.gameMode = 'classic'; // Always classic
    }

    getScore() {
        return this.score + this.bonusPoints;
    }
    
    getTotalScore() {
        return this.score + this.bonusPoints;
    }
    
    getHighScore() {
        return this.highScore;
    }
    
    getComboCount() {
        return this.comboCount;
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('fibonacciFusion_highScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score to localStorage');
        }
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('fibonacciFusion_highScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('Could not load high score from localStorage');
            return 0;
        }
    }
}

export default Scoring;