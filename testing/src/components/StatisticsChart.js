import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import randomColor from 'randomcolor';

const StatisticsChart = ({ data, xAxisKey, barKey }) => {
    const colors = data.reduce((acc, row) => {
        if (!acc[row[xAxisKey]]) {
            acc[row[xAxisKey]] = randomColor();
        }
        return acc;
    }, {});

    const chartData = data.map(row => (
        {
            [xAxisKey]: row[xAxisKey],
            [barKey]: row[barKey],
            fill: colors[row[xAxisKey]]
        }
    ));

    const legendItems = Object.entries(colors).map(([name, color]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: color, marginRight: '5px' }} />
            <div>{name}</div>
        </div>
    ));

    return (
        <div style={{ display: 'flex' }}>
            <BarChart width={800} height={400} data={chartData}>
                <XAxis dataKey={xAxisKey} tick={false} />
                <YAxis />
                <CartesianGrid strokeDasharray="5 5" />
                <Tooltip />
                <Bar dataKey={barKey} fill="#8884d8" />
            </BarChart>
            <div style={{ marginLeft: '30px', color: 'white'}}>
                {legendItems}
            </div>
        </div>
    )
};

export default StatisticsChart;