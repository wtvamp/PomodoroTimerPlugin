
# Pomodoro Timer Plugin for Chart.js

This project provides a Pomodoro Timer Plugin designed to integrate with Chart.js, offering a unique way to visualize Pomodoro cycles within chart elements. Ideal for productivity apps or any application that utilizes the Pomodoro Technique and Chart.js for data visualization.

## Features

- **Customizable Text Prompts**: Configure messages for different timer states like start, work session, and completion.
- **Dynamic Positioning**: Place text prompts at the top, bottom, or center of the chart area.
- **Flexible Styling**: Customize text color and adjust padding dynamically to fit the text.


## Installation and Setup

To get started with the Pomodoro Timer Plugin, clone the repository and install the necessary dependencies.

```bash
git clone https://github.com/wtvamp/PomodoroTimerPlugin
cd PomodoroTimerPlugin
npm install
```

## Building the Plugin

Use Webpack to build the plugin. This process bundles your plugin into a single JavaScript file located in the `dist/` directory.

```bash
npm run build
```

## Developing while Running the Plugin Locally

To start a development server with hot reloading, run:

```bash
npm run start
```

This will open your default web browser and navigate to the plugin's sample page, where you can see the plugin in action.

Updates to the code will be reflected in real-time.

## Testing

The project includes jest unit tests to ensure the plugin's functionality. To run the tests, execute:

```bash
npm run test
```

Tests are stored in the tests directory and end with file.test.js

## Using the Pomodoro Plugin in Your Projects

To use the Pomodoro Timer Plugin in your own projects:

1a)  Include the bundled JavaScript file in your HTML file and initialize it with Chart.js as follows:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="path/to/dist/pomodoro-timer-plugin.js"></script>
```

**OR**

1b) Install ChartJS and PomodoroTimerPlug.js via npm
```bash
npm install chartjs
npm install pomodorotimerplugin
```

Then import ChartJS and PomodoroTimerPlugin into your page:
```javascript
import DoughnutLabel from 'chartjs-plugin-doughnutlabel-v3';
import PomodoroTimerPlugin from './PomodoroTimerPlugin';
```

2)  Create the following html - along with 4 buttons:
```html
<canvas id="pomodoroChart"></canvas>
<input type="text" id="timerInput" placeholder="Enter time in minutes" value="2" min="1" max="60" />
<button id="timerStart" class="pomodoroButton">Start</button>
<button id="timerStop" class="pomodoroButton">Stop</button>
<button id="timerReset" class="pomodoroButton">Reset</button>
```

3)  Register the plugin with ChartJS
```javascript
Chart.register(PomodoroTimerPlugin);
```

4) Finally, use the following JavaScript to initialize the chart with the plugin.  Match each of the inputs/button ids to the plugin options.
```javascript
const el = document.getElementById('pomodoroChart');
const data = {
    labels: ['Timer','White Space'],
    datasets: [{
    label: 'Pomodoro Timer',
    data: [0,12],
    backgroundColor: [
        'rgba(255, 26, 104, 1)',
        'rgba(255, 26, 104, 0.1)',
    ],
    borderColor: [
        'rgba(255, 26, 104, 1)',
        'rgba(255, 26, 104, 0.0)',
    ],
    cutout: '95%'
    }]
};
const pomodoroChart = new Chart(el, {
    type: 'doughnut',
    data: data,
    options: {
        plugins: {
            PomodoroTimerPlugin: {
                timerInputId: "timerInput",
                startButtonId: "timerStart",
                stopButtonId: "timerStop",
                resetButtonId: "timerReset",
                largeTextLocation: "top",
                smallTextLocation: "top",
                textColor: "purple"
            },
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        }
    }
});
```
# Version 0.4.0-beta

## Customize Text Location:

The Pomodoro Timer Plugin now supports customizable text messages, allowing you to tailor the plugin's display to better fit your application's needs or language preferences. The customizable text options include:

- `largeTextLocation`: The startPrompt and hours/minutes countdown location // Options: "top", "center", "bottom"
- `smallTextLocation`: The secondaryPrompt and timePassing/Complete message location, // Options: "top", "center", "bottom"

Both options default to "center" placement

## Customizing Text Messages

The Pomodoro Timer Plugin now supports customizable text messages, allowing you to tailor the plugin's display to better fit your application's needs or language preferences. The customizable text options include:

- `startPrompt`: The message displayed before the timer starts.
- `secondaryPrompt`: Additional instructions or information displayed before starting the timer.
- `timePassingMessage`: The message shown while the timer is running.
- `timeCompleteMessage`: The message displayed when the timer completes.

### Configuring Text Messages

To configure these messages, include them in the plugin options when initializing the Pomodoro Timer Plugin with Chart.js:

```javascript
const pomodoroChart = new Chart(el, {
    type: 'doughnut',
    data: data,
    options: {
        plugins: {
            PomodoroTimerPlugin: {
                timerInputId: "timerInput",
                startButtonId: "timerStart",
                stopButtonId: "timerStop",
                resetButtonId: "timerReset",
                textColor: "#ff1a68", // Optional: Customize text color
                largeTextLocation: "top", // Options: "top", "center", "bottom"
                smallTextLocation: "bottom", // Options: "top", "center", "bottom"
                startPrompt: "Ready to Focus?",
                secondaryPrompt: "Set Duration and Start",
                timePassingMessage: "Stay Focused...",
                timeCompleteMessage: "Take a Break!"
            }
        }
    }
});
```

This configuration allows you to provide a more personalized experience to users of your application, guiding them through the Pomodoro technique with custom messages.

### Dynamically Updating Messages

You can also update these messages dynamically after the chart has been initialized. This is useful for applications that need to change the language or messaging based on user interactions or other conditions. Use the `updateMessages` method provided by the plugin:

```javascript
// Assuming pomodoroChart is your Chart.js instance with the Pomodoro Timer Plugin initialized
pomodoroChart.options.plugins.PomodoroTimerPlugin.updateMessages({
    startPrompt: "New Start Message",
    secondaryPrompt: "New Instructions",
    timePassingMessage: "Keep Going!",
    timeCompleteMessage: "Break Time!"
});

// Don't forget to update the chart to reflect the changes
pomodoroChart.update();
```

This method allows for real-time updates to the messaging within the Pomodoro Timer Plugin, enhancing the flexibility and dynamism of your application.


## Contributing

Contributions to the Pomodoro Timer Plugin are welcome. Please follow the standard GitHub pull request workflow to propose changes.

## License

This project is licensed under the MIT [LICENSE](LICENSE) included in the repository.
