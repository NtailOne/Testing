import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StatisticsChart = ({ data, xAxisKey, barKey }) => {

    return (
        <BarChart width={800} height={400} data={data}>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <CartesianGrid strokeDasharray="2 2" />
            <Tooltip />
            <Legend />
            <Bar dataKey={barKey} fill="#8884d8" />
        </BarChart>
    )
};

export default StatisticsChart;