                <!--
                        <svg width="400px" height="120px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 450">
                            <a href="http://metrics.green-coding.io/stats.html?id=${runs_data[idx][0]}#RUNTIME__Browse%20to%20and%20idle" target='_blank' rel='noopener'>

                                <rect x="0" y="0" width="1000" height="75" fill="#333"></rect>
                                <text x="500" y="38" font-size="50" fill="white" text-anchor="middle" dominant-baseline="middle">${truncate(runs_data[idx][7]['__GMT_VAR_PAGE__'])}</text>

                                <!-- Center bars -->
                                <rect x="200" y="75" width="600" height="150" fill="${energy_color}"></rect>
                                <rect x="200" y="225" width="600" height="150" fill="${network_carbon_color}"></rect>


                                <!-- Left green box with A -->
                                <rect x="0" y="75" width="200" height="300" fill="${energy_color}"></rect>
                                <text x="100" y="250" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">${energy_class}</text>
                                <text x="225" y="150" font-size="40" fill="white" text-anchor="left" dominant-baseline="middle">Energy (Browser): ${cpu_energy} Wh</text>

                                <!-- Right red box with B -->
                                <rect x="800" y="75" width="200" height="300" fill="${network_carbon_color}"></rect>
                                <text x="900" y="250" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">${network_carbon_class}</text>
                                <text x="225" y="300" font-size="40" fill="white" text-anchor="left" dominant-baseline="middle">Carbon (Network): ${network_carbon} gCO2</text>

                                <!-- Link -->
                                <rect x="0" y="375" width="1000" height="75" fill="#333"></rect>
                                <text x="500" y="415" font-size="50" fill="white" text-anchor="middle" dominant-baseline="middle">${(new Date(runs_data[idx][4])).toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' })}</text>
                            </a>
                        </svg>
-->