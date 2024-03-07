const PomodoroTimerPlugin = {
    privateVariables: new WeakMap(),

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

    install: function (chart, args, options) {
        console.log("Installing Pomodoro Timer Plugin");
        // Extract new configurable messages from options
        const { timerInputId, startButtonId, stopButtonId, resetButtonId, textColor, largeTextLocation, smallTextLocation, startPrompt = "Enter Time", secondaryPrompt = "Then Press Start", timePassingMessage = "Work", timeCompleteMessage = "Time's Up" } = options;
 
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
            largeTextLocation: largeTextLocation || 'center', // Default to center if not specified
            smallTextLocation: smallTextLocation || 'center', // Default to center if not specified
            textColor: textColor === undefined ? "black" : textColor,
            startPrompt,
            secondaryPrompt,
            timePassingMessage,
            timeCompleteMessage
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
            // Retrieve the current settings for text location and color
            let pluginSettings = this.privateVariables.get(this);
            this.privateVariables.set(this, {
                ...pluginSettings, // Preserve existing settings
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

PomodoroTimerPlugin.id = 'PomodoroTimerPlugin';

export default PomodoroTimerPlugin;
