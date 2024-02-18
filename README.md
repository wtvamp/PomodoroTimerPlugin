
# Pomodoro Timer Plugin for Chart.js

This project provides a Pomodoro Timer Plugin designed to integrate with Chart.js, offering a unique way to visualize Pomodoro cycles within chart elements. Ideal for productivity apps or any application that utilizes the Pomodoro Technique and Chart.js for data visualization.

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
                resetButtonId: "timerReset"
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


## Contributing

Contributions to the Pomodoro Timer Plugin are welcome. Please follow the standard GitHub pull request workflow to propose changes.

## License

This project is licensed under the MIT [LICENSE](LICENSE) included in the repository.
