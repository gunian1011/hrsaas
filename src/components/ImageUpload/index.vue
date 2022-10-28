<template>
    <div>
        <!-- file-list 是上传的文件列表 可以绑定到上传组件中 让上传组件来显示 -->
        <el-upload 
            list-type="picture-card"
            :limit="1" 
            action="#" 
            :on-preview="preview"
            :on-change="changeFile"
            :file-list="fileList"
            :http-request="upload"
            :before-upload="beforeUpload"
            :class="{ disabled: fileComputed }"
            :on-remove="handleRemove"
            >
            <i class="el-icon-plus" />
        </el-upload>
        <el-progress v-if="showPercent" style="width: 180px" :percentage="percent" />
        <el-dialog :visible.sync="showDialog" title="图片预览">
            <img :src="imgUrl" alt="" style="width: 100%">
        </el-dialog>
    </div>
    
</template>

<script>
import COS from 'cos-js-sdk-v5'  // 引入腾讯云的COS包
// 实例化COS对象
const cos = new COS ({
    SecretId: 'AKIDfAcwHbqy1upZCiu9GC6ugIj5QtHaie8U',  // 身份识别
    SecretKey: 'GKF5ygBZljZOaiu5RmCXrFWhrqdGoIep',  // 身份秘钥
})
export default {
    data() {
        return {
            fileList: [],
            showDialog: false,
            imgUrl: '',
            currentFileUid: null, // 记录当前正在上传的UID
            percent: 0,  // 百分比进度条
            showPercent: false,
        }
    },
    computed: {
        // 设定一个计算属性，  判断是否上传完一张
        fileComputed() {
            return this.fileList.length === 1
        }
    },
    methods: {
        // 点击预览事件
        preview(file) {
            this.imgUrl = file.url
            this.showDialog = true
        },
        handleRemove(file, fileList) {
            // file是点击删除的文件
            // 将原来的文件删除掉  剩下的就是最新的数组了
            // 两种方式都是可以的
            // this.fileList = this.fileList.filter(item => item.uid !== file.uid)
            this.fileList = fileList
        },
        // 不能用push 这个钩子会执行多次
        changeFile(file, fileList) {
            // 如果当前fileList中没有该文件的话 就往里进行添加
            this.fileList = fileList.map(item => item)
            // 这里不成功 是因为现在还没有上传 所以第二次进来的数据一定是个空的
            // 如果完成上传动作了 第一次进入和第二次进去的fileLIS的长度都是1
            // 上传成功 => 数据才会进来 => 腾讯云
        },
        beforeUpload(file) {
            // console.log(file)
            // 先检查文件类型
            const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/jpg', 'image/png']
            if (!types.some(item => item === file.type)) {
                // 如果不存在
                this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
                return false  //  上传终止
            }
            // 检查文件大小 
            const maxSize = 5 * 1024 * 1024
            if (file.size > maxSize) {
                // 如果超过了限制
                this.$message.error('上传的图片大小不能超过5M')
                return false
            }
            // 已经确定当前上传的就是当前的这个file
            this.currentFileUid = file.uid
            this.showPercent = true
            return true  // 最后一定要return true
        },
        // 进行上传操作
        upload(params) {
            if (params.file) {
                // 执行上传操作
                cos.putObject({
                    // 上传到腾讯云 哪一个存储桶
                    Bucket: 'gunian-1259310321', // 存储桶
                    Region: 'ap-beijing', // 地域
                    Key: params.file.name, // 文件名
                    Body: params.file,  // 上传的文件对象
                    StorageClass: 'STANDARD',  // 上传的模式类型  默认标准模式即可
                    onProgress: (params) => {
                        // console.log(params)
                        this.percent = params.percent * 100
                    }
                }, (err, data) => {
                    // 判断错误和成功
                    // console.log(err || data)
                    // data中有一个stausCODE === 200的时候 说明文件上传成功
                    if(!err && data.statusCode === 200) {
                        // 此时说明文件上传成功  要获取成功的返回地址
                        // fileLIst才能显示到上传组件上 此时要将fileList中的数组的URL地址变成现在上传成功的地址
                        // 目前虽然是一张图片 但是 fileLIst是一个数组
                        // 需要知道当前上传成功的是哪一张图片
                        this.fileList = this.fileList.map(item => {
                            // 去找是的uid等于刚刚记录下的id
                            if(item.uid === this.currentFileUid) {
                                // 将成功的地址赋值给原来的url属性
                                return { url: 'http://' + data.Location, upload: true }
                                // upload为true表示这张图片已经上传完毕 这个属性要为后期应用的时候做标记
                            }
                            return item
                        })
                        // 关闭进度条
                        // 重置百分比
                        setTimeout(() => {
                            this.showPercent = false
                            this.percent = 0
                        },1000)
                        
                        // 将上传成功的地址 回写到了fileList中
                    }
                })
            }
        }
    }
}
</script>

<style>
    .disabled .el-upload--picture-card {
        display: none;
    }
</style>