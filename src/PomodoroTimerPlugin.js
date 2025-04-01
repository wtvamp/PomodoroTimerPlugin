"use strict";

const PomodoroTimerPlugin = {
    privateVariables: new WeakMap(),

    getTime: function() {
        const { time } = this.privateVariables.get(this);
        return time;
    },

    setTime: function(newTime) {
        let settings = this.privateVariables.get(this) || {};
        const minutes = Math.floor(newTime / 60);
        const seconds = newTime % 60;
        this.privateVariables.set(this, {
            ...settings,
            time: newTime,
            minutes: minutes < 10 ? '0' + minutes : minutes,
            seconds: seconds < 10 ? '0' + seconds : seconds
        });
    },
    
    getCurrentTask: function(){
        const { timePassingMessage } = this.privateVariables.get(this);
        return timePassingMessage;
    },

    updateTaskCycle: function(timeElement, shortBreakElement, longBreakElement) {
        let currentVariables = this.privateVariables.get(this);
        const taskTime = timeElement.value * 60;
        const shortBreakTime = shortBreakElement.value * 60;
        const longBreakTime = longBreakElement.value * 60;
        this.privateVariables.set(this, {
            ...currentVariables,
            taskCycle: [taskTime, shortBreakTime, taskTime, shortBreakTime, taskTime, longBreakTime]
        })
    },

    triggerNotification: function(){
        const notify = new CustomEvent("pomodoroTimerNotification", {
            detail: {
                currentTask: this.getCurrentTask()
            }
        })
        window.dispatchEvent(notify);
    },

    getTextPosition: function(chartHeight, textHeight, position, offset = 0) {
        // Added an offset parameter to customize positioning further
        switch (position) {
            case 'top':
                return textHeight + offset;
            case 'center':
                return chartHeight / 2 + offset;
            case 'bottom':
                return chartHeight - (textHeight + offset);
            default:
                return chartHeight / 2 + offset; // Fallback to center if undefined
        }
    },

    beforeUpdate: function(chart, args, options) {
        const pluginOptions = this.privateVariables.get(this) || {};
        const { largeTextLocation, smallTextLocation } = pluginOptions;
        // Define extra padding needed for the text. Adjust these values as needed.
        const extraPaddingTop = largeTextLocation === 'top' || smallTextLocation === 'top' ? 60 : 0;
        const extraPaddingBottom = largeTextLocation === 'bottom' || smallTextLocation === 'bottom' ? 60 : 0;

        // Check and adjust the chart's layout padding accordingly
        const layoutPadding = chart.options.layout && chart.options.layout.padding ? chart.options.layout.padding : {};

        chart.options.layout.padding = {
            top: Math.max(layoutPadding.top || 0, extraPaddingTop),
            bottom: Math.max(layoutPadding.bottom || 0, extraPaddingBottom),
            // Preserve left and right padding if already set
            left: layoutPadding.left || 0,
            right: layoutPadding.right || 0
        };
    },

    beforeDraw: function (chart, args) {
        const { ctx, chartArea: { top, bottom }, width, options } = chart;
        let { time, minutes, seconds, textColor, largeTextLocation, smallTextLocation, startPrompt, secondaryPrompt, timePassingMessage, timeCompleteMessage } = this.privateVariables.get(this);
      
        const padding = options.layout.padding || { top: 0, bottom: 0, left: 0, right: 0 };
        const textPadding = 10; // Additional padding for text from edges or chart
    
        // Calculate the size of the texts
        const largeTextSize = Math.min(width, bottom - top) * 0.1;
        const smallTextSize = Math.min(width, bottom - top) * 0.05;
    
        // Calculate Y position for large text based on its specified location
        let largeTextY;
        switch (largeTextLocation) {
            case 'top':
                largeTextY = top - padding.top - textPadding + largeTextSize + 1;
                break;
            case 'bottom':
                largeTextY = bottom + padding.bottom - textPadding - smallTextSize;
                break;
            case 'center':
            default:
                largeTextY = top + (bottom - top) / 2 - largeTextSize / 2;
                break;
        }
    
        // Calculate Y position for small text based on its specified location
        let smallTextY;
        switch (smallTextLocation) {
            case 'top':
                smallTextY = top - padding.top + textPadding + largeTextSize;
                break;
            case 'bottom':
                smallTextY = bottom + padding.bottom - textPadding + 3;
                break;
            case 'center':
            default:
                smallTextY = top + (bottom - top) / 2 + smallTextSize / 2;
                break;
        }
    
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
    
        // Drawing large text
        ctx.font = `bolder ${largeTextSize}px Arial`;
        let largeText = minutes === undefined ? startPrompt : `${minutes}:${seconds}`;
        ctx.fillText(largeText, width / 2, largeTextY);
    
        // Drawing small text
        ctx.font = `bolder ${smallTextSize}px Arial`;
        let smallText = minutes === undefined ? secondaryPrompt : (time > 0 ? timePassingMessage : timeCompleteMessage);
        ctx.fillStyle = time <= 0 ? 'red' : textColor;
        ctx.fillText(smallText, width / 2, smallTextY);
    
        ctx.restore();
    },

    handleStopTimer: function() {
        const {timeElement, shortBreakElement, longBreakElement, startButtonElement, stopButtonElement, resetButtonElement} = this.privateVariables.get(this);
        this.stopTimer();
        timeElement.disabled = true;
        shortBreakElement.disabled = true;
        longBreakElement.disabled = true;
        startButtonElement.disabled = false;
        stopButtonElement.disabled = true;
        resetButtonElement.disabled = false;
    },

    handleStartTimer: function() {
        const {timeElement, shortBreakElement, longBreakElement, startButtonElement, stopButtonElement, resetButtonElement, chart} = this.privateVariables.get(this);
        this.updateTaskCycle(timeElement, shortBreakElement, longBreakElement);
        let { clear, time, taskCycle, taskCycleIndex } = this.privateVariables.get(this);

        if (timeElement.disabled === false) {
            time = taskCycle[0] + 1; // allows the timer to actually start with the full amount instead of being 1s off (e.g. when I ran a 6s timer, the timer only ticked 5 times )
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
            time: time,
            timePassingMessage: taskCycleIndex === taskCycle.length - 1 ? "Long Rest" : taskCycleIndex % 2 === 0 ? "Work" : "Short Rest"
        });
        
        timeElement.disabled = true;
        shortBreakElement.disabled = true;
        longBreakElement.disabled = true;
        startButtonElement.disabled = true;
        stopButtonElement.disabled = false;
        resetButtonElement.disabled = false;
    },
    
    handleResetTimer: function() {
        const {timeElement, shortBreakElement, longBreakElement, startButtonElement, stopButtonElement, resetButtonElement, chart} = this.privateVariables.get(this);
        timeElement.disabled = false;
        shortBreakElement.disabled = false;
        longBreakElement.disabled = false;
        startButtonElement.disabled = false;
        stopButtonElement.disabled = true;
        resetButtonElement.disabled = true;
        const time = timeElement.value * 60
        const minutes = Math.floor(time / 60);
        // Retrieve the current settings for text location and color
        let pluginSettings = this.privateVariables.get(this);
        this.privateVariables.set(this, {
            ...pluginSettings, // Preserve existing settings
            time: time,
            timeLeft: 0,
            minutes: minutes < 10 ? '0' + minutes : minutes,
            seconds: (time % 60) < 10 ? '0' + time % 60 : time % 60,
            timePassingMessage: "Ready to Start",
            taskCycleIndex: 0
        });
        this.stopTimer();
        chart.data.datasets[0].data = [0, time];
        chart.update();
    },

    handleSkipTimer: function() {
        let { taskCycle, taskCycleIndex, time, timeLeft } = this.privateVariables.get(this);
        if(taskCycleIndex < taskCycle.length - 1){
            timeLeft = -1; //setting this to 0 causes chart to re-render on new cycle with 1s already filled in
            taskCycleIndex++;
            time = taskCycle[taskCycleIndex] + 1; // add 1 to offset the time it takes to render, otherwise subsequent timers will be off by 1 (e.g. 60s timers will only be for 59s)
            this.privateVariables.set(this, {
                ...this.privateVariables.get(this),
                time: time,
                timeLeft: timeLeft,
                taskCycleIndex: taskCycleIndex,
                timePassingMessage: taskCycleIndex === taskCycle.length - 1 ? "Long Rest" : taskCycleIndex % 2 === 0 ? "Work" : "Short Rest"
            });
        } else if(taskCycleIndex == taskCycle.length - 1){
            this.handleResetTimer();
            this.privateVariables.set(this, {
                ...this.privateVariables.get(this),
                taskCycleIndex: 0,
            })
            return;
        }
    },

    install: function (chart, args, options) {
        console.log("Installing Pomodoro Timer Plugin");
        // Extract new configurable messages from options
        const { timerInputId, shortBreakInputId, longBreakInputId, startButtonId, stopButtonId, resetButtonId, textColor, largeTextLocation, smallTextLocation, startPrompt = "Enter Time", secondaryPrompt = "Then Press Start", timePassingMessage = "Ready To Start", timeCompleteMessage = "Time's Up" } = options;
 
        
        const timeElement = document.getElementById(timerInputId);
        const shortBreakElement = document.getElementById(shortBreakInputId);
        const longBreakElement = document.getElementById(longBreakInputId);

        const startButtonElement = document.getElementById(startButtonId);
        const stopButtonElement = document.getElementById(stopButtonId);
        const resetButtonElement = document.getElementById(resetButtonId);

        if (!timeElement) {
            throw new Error(`Timer element with the ID '${timerInputId}' not found.`);
        }
        if (!shortBreakElement) {
            throw new Error(`Short break element with the ID '${shortBreakInputId} not found.`);
        }
        if (!longBreakElement) {
            throw new Error(`Long break element with the ID '${longBreakInputId} not found.`);
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
        console.log(textColor); // do we still neeed this here?
        this.privateVariables.set(this, {
            taskCycle: [
                timeElement.value * 60,
                shortBreakElement.value * 60,
                timeElement.value * 60,
                shortBreakElement.value * 60,
                timeElement.value * 60,
                longBreakElement.value * 60,
            ],
            taskCycleIndex: 0,
            time: timeElement.value * 60,
            timeLeft: -1, // setting this to 0 causes a 60s timer to start at 59s because of the 1s delay within `.newClear()` on line 181
            startingMinutes: timeElement.value,
            clear: null,
            largeTextLocation: largeTextLocation || 'center', // Default to center if not specified
            smallTextLocation: smallTextLocation || 'center', // Default to center if not specified
            textColor: textColor === undefined ? "black" : textColor,
            startPrompt,
            secondaryPrompt,
            timePassingMessage,
            timeCompleteMessage,
            timeElement: timeElement,
            shortBreakElement: shortBreakElement,
            longBreakElement: longBreakElement,
            startButtonElement: startButtonElement,
            stopButtonElement: stopButtonElement,
            resetButtonElement: resetButtonElement,
            chart: chart
        });

        stopButtonElement.disabled = true;
        resetButtonElement.disabled = true;

        startButtonElement.addEventListener('click', () => this.handleStartTimer());

        stopButtonElement.addEventListener('click', () => this.handleStopTimer());

        resetButtonElement.addEventListener('click', () => this.handleResetTimer());
    },

    updateCountdown: function (chart) {
        let { taskCycle, taskCycleIndex, time, timeLeft, minutes, seconds } = this.privateVariables.get(this);
        if (time <= 0) {
            if(taskCycleIndex < taskCycle.length - 1){
                timeLeft = -1; //setting this to 0 causes chart to re-render on new cycle with 1s already filled in
                taskCycleIndex++;
                time = taskCycle[taskCycleIndex] + 1; // add 1 to offset the time it takes to render, otherwise subsequent timers will be off by 1 (e.g. 60s timers will only be for 59s)
                this.privateVariables.set(this, {
                    ...this.privateVariables.get(this),
                    timeLeft: timeLeft,
                    taskCycleIndex: taskCycleIndex,
                    timePassingMessage: taskCycleIndex === taskCycle.length - 1 ? "Long Rest" : taskCycleIndex % 2 === 0 ? "Work" : "Short Rest"
                });
                this.triggerNotification();
            } else if(taskCycleIndex == taskCycle.length - 1){
                this.triggerNotification();
                this.stopTimer();
                return;
            }
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
    },

    /**
     * Updates the text messages used by the Pomodoro Timer Plugin in real-time.
     *
     * This method allows for the dynamic updating of configurable text messages within the plugin,
     * including prompts displayed at different stages of the timer's operation. It is useful for
     * changing the text based on user interaction or other runtime conditions.
     *
     * @param {Object} newMessages - An object containing the text messages to be updated. Each key
     * corresponds to a specific message within the plugin, and the associated value is the new text
     * for that message. The possible keys include:
     *   - startPrompt: The message displayed before the timer starts.
     *   - secondaryPrompt: The message displayed as a secondary instruction or information.
     *   - timePassingMessage: The message displayed while the timer is running.
     *   - timeCompleteMessage: The message displayed when the timer completes.
     *
     * Note: Only the messages provided in the `newMessages` object will be updated; any omitted
     * messages will retain their current values.
     *
     * Usage:
     *   PomodoroTimerPlugin.updateMessages({
     *     startPrompt: "New Start Prompt",
     *     secondaryPrompt: "New Secondary Prompt",
     *     timePassingMessage: "Keep Going!",
     *     timeCompleteMessage: "Done!"
     *   });
     *
     * @returns {void} This method does not return a value.
     */
    updateMessages: function(newMessages) {
        let settings = this.privateVariables.get(this);
        // Update the stored messages with new values
        this.privateVariables.set(this, {
            ...settings,
            ...newMessages
        });
    }
};

// makes methods immutable
Object.defineProperty(PomodoroTimerPlugin, 'install', {value: PomodoroTimerPlugin.install, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'beforeUpdate', {value: PomodoroTimerPlugin.beforeUpdate, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'beforeDraw', {value: PomodoroTimerPlugin.beforeDraw, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'getTime', {value: PomodoroTimerPlugin.getTime, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'getCurrentTask', {value: PomodoroTimerPlugin.getCurrentTask, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'updateTaskCycle', {value: PomodoroTimerPlugin.updateTaskCycle, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'triggerNotification', {value: PomodoroTimerPlugin.triggerNotification, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'getTextPosition', {value: PomodoroTimerPlugin.getTextPosition, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'updateCountdown', {value: PomodoroTimerPlugin.updateCountdown, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'updateMessages', {value: PomodoroTimerPlugin.updateMessages, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'stopTimer', {value: PomodoroTimerPlugin.stopTimer, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'handleStartTimer', {value: PomodoroTimerPlugin.handleStartTimer, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'handleStopTimer', {value: PomodoroTimerPlugin.handleStopTimer, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'handleSkipTimer', {value: PomodoroTimerPlugin.handleSkipTimer, writable: false, configurable: false, enumerable: true})

Object.defineProperty(PomodoroTimerPlugin, 'handleResetTimer', {value: PomodoroTimerPlugin.handleResetTimer, writable: false, configurable: false, enumerable: true})

PomodoroTimerPlugin.id = 'PomodoroTimerPlugin';

export default PomodoroTimerPlugin;
