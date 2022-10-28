<template>
  <!-- 雷达图 做图表的时候必须给高宽 -->
  <div ref="myDiv" class="radar-echart" />
</template>

<script>
// 完整的加载
var echarts = require('echarts')
// var echarts = require('echarts/lib/echarts')  // 引入echarts主模块
// require('echarts/lib/chart/radar')  // 引入雷达图
// 引入提示框和标题组件
// require('echarts/lib/component/tooltip')
// require('echarts/lib/component/title')
export default {
    mounted() {
        const myChart = echarts.init(this.$refs.myDiv)  // 得到图表的实例

        myChart.setOption({
            title: {
                text: '基础雷达图'
            },
            legend: {
                data: ['孙财', '罗晓晓']
            },
            tooltip: {},
            radar: { 
                // 每个区域的最高值
                indicator: [
                { name: '工作效率', max: 100 },
                { name: '考勤', max: 100 },
                { name: '积极性', max: 100 },
                { name: '帮助同事', max: 100 },
                { name: '正确率', max: 100 },
                { name: '自主学习', max: 100 }
                ]
            },
            series: [
                {
                name: '孙财 vs 罗晓晓',
                type: 'radar',
                data: [
                    {
                    value: [99, 90, 80, 35, 50, 80],
                    name: '孙财'
                    },
                    {
                    value: [97, 94, 88, 66, 42, 91],
                    name: '罗晓晓'
                    }
                ]
                }
            ]
        });
    }
}
</script>

<style scoped>

    .radar-echart {
        height: 400px;
        width: 600px;
    }
</style>