const PomodoroTimerPlugin = {
    privateVariables: new WeakMap(),

    beforeDraw: function (chart, args) {
        const { ctx, chartArea: { width, height } } = chart;
        let { time, minutes, seconds, textColor } = this.privateVariables.get(this);

        ctx.save();
        ctx.font = `bolder ${Math.min(width, height) * 0.1}px Arial`;
        ctx.fillStyle = textColor;
        if (minutes === undefined) {
            ctx.fillText("Enter Time", width / 2, height / 2);
        }
        else {
            ctx.fillText(`${minutes}:${seconds}`, width / 2, height / 2);
        }
        ctx.restore();

        ctx.font = `bolder ${Math.min(width, height) * 0.05}px Arial`;
        ctx.textAlign = 'center';
        if (minutes === undefined) {
            ctx.fillStyle = textColor;
            ctx.fillText('Then Press Start', width / 2, height / 2 + Math.min(width, height) * 0.15);
        }
        else if (time > 0) {
            ctx.fillStyle = textColor;
            ctx.fillText('Work', width / 2, height / 2 + Math.min(width, height) * 0.15);
        }
        if (time <= 0) {
            ctx.font = `bolder ${Math.min(width, height) * 0.05}px Arial`;
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText("Time's Up", width / 2, height / 2 + Math.min(width, height) * 0.15);
        }
    },

    install: function (chart, args, options) {
        console.log("Installing Pomodoro Timer Plugin");
        const { timerInputId, startButtonId, stopButtonId, resetButtonId, textColor } = options;
        const timeElement = document.getElementById(timerInputId);
        const startButtonElement = document.getElementById(startButtonId);
        const stopButtonElement = document.getElementById(stopButtonId);
        const resetButtonElement = document.getElementById(resetButtonId);

        if (!timeElement) {
            throw new Error(`Timer element with ID '${timerInputId}' not found.`);
        }
        if (!startButtonElement) {
            throw new Error(`Start button element with ID '${startButtonId}' not found.`);
        }
        if (!stopButtonElement) {
            throw new Error(`Stop button element with ID '${stopButtonId}' not found.`);
        }
        if (!resetButtonElement) {
            throw new Error(`Reset button element with ID '${stopButtonId}' not found.`);
        }
        console.log(textColor);
        this.privateVariables.set(this, {
            time: timeElement.value * 60,
            timeLeft: 0,
            startingMinutes: timeElement.value,
            clear: null,
            textColor: textColor === undefined ? "black" : "purple"
        });

        stopButtonElement.disabled = true;
        resetButtonElement.disabled = true;

        startButtonElement.addEventListener('click', () => {
            let { clear, time } = this.privateVariables.get(this);
            if (timeElement.disabled === false) {
                time = timeElement.value * 60;
            }
            if (clear) {
                clearInterval(clear); // Clear existing interval if any
            }
            const newClear = setInterval(() => {
                this.updateCountdown(chart); 
            }, 1000);

            this.privateVariables.set(this, {
                ...this.privateVariables.get(this), // Preserve other properties
                clear: newClear,
                time: time
            });
            timeElement.disabled = true;
            startButtonElement.disabled = true;
            stopButtonElement.disabled = false;
            resetButtonElement.disabled = false;
        });

        stopButtonElement.addEventListener('click', () => {
            this.stopTimer();
            timeElement.disabled = true;
            startButtonElement.disabled = false;
            stopButtonElement.disabled = true;
            resetButtonElement.disabled = false;
        });

        resetButtonElement.addEventListener('click', () => {
            timeElement.disabled = false;
            startButtonElement.disabled = false;
            stopButtonElement.disabled = true;
            resetButtonElement.disabled = true;
            const time = timeElement.value * 60
            const minutes = Math.floor(time / 60);
            this.privateVariables.set(this, {
                time: time,
                timeLeft: 0,
                minutes: minutes < 10 ? '0' + minutes : minutes,
                seconds: (time % 60) < 10 ? '0' + time % 60 : time % 60
            });
            this.stopTimer();
            chart.config.data.datasets[0].data = [0, time];
            chart.update();
        });
    },

    updateCountdown: function (chart) {
        let { time, timeLeft, minutes, seconds } = this.privateVariables.get(this);
        if (time <= 0) {
            this.stopTimer();
            return;
        }

        time--; // Decrease time by 1 second
        timeLeft++; // Increment timeLeft
        minutes = Math.floor(time / 60) < 10 ? '0' + Math.floor(time / 60) : Math.floor(time / 60);
        seconds = (time % 60) < 10 ? '0' + time % 60 : time % 60;

        this.privateVariables.set(this, {
            ...this.privateVariables.get(this), // Preserve other properties
            time: time,
            timeLeft: timeLeft,
            minutes: minutes,
            seconds: seconds
        });

        // Update chart data
        chart.data.datasets[0].data[0] = timeLeft;
        chart.data.datasets[0].data[1] = time;
        chart.update();
    },

    stopTimer: function () {
        const { clear } = this.privateVariables.get(this);
        clearInterval(clear);
        clearTimeout(clear);
    }
};

PomodoroTimerPlugin.id = 'PomodoroTimerPlugin';

export default PomodoroTimerPlugin;
