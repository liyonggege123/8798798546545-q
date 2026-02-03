// 工序列表
const processes = [
    { id: 'review', name: '评审' },
    { id: 'preparation', name: '生产准备' },
    { id: 'production', name: '生产' },
    { id: 'inspection', name: '质检' },
    { id: 'packaging', name: '包装' }
];

// 从localStorage加载工单数据
function loadWorkOrders() {
    const data = localStorage.getItem('workOrders');
    return data ? JSON.parse(data) : [];
}

// 返回主页
function goBack() {
    window.location.href = 'index.html';
}

// 查看报工记录
function viewReportRecord(orderId, processId) {
    try {
        console.log('查看报工记录:', orderId, processId);
        // 加载报工数据
        const reports = loadReports();
        console.log('所有报工数据:', reports);
        console.log('reports类型:', typeof reports);
        console.log('reports是否为数组:', Array.isArray(reports));
        const reportKey = `${orderId}_${processId}`;
        console.log('报工记录键:', reportKey);
        
        // 修复：如果reports是数组，将其转换为对象
        let fixedReports = reports;
        if (Array.isArray(reports)) {
            console.log('检测到reports是数组，正在转换为对象...');
            fixedReports = {};
            // 尝试从数组中提取有效数据
            reports.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    // 检查item是否包含orderId和processId
                    if (item.orderId && item.processId) {
                        // 如果item包含orderId和processId，使用它们生成键
                        const itemKey = `${item.orderId}_${item.processId}`;
                        fixedReports[itemKey] = item;
                        console.log('从数组元素中提取数据，生成键:', itemKey);
                    } else {
                        // 否则，尝试查找包含下划线的键（可能是${orderId}_${processId}格式）
                        for (const key in item) {
                            if (key.includes('_')) {
                                fixedReports[key] = item[key];
                                console.log('从数组元素中提取数据，使用现有键:', key);
                            }
                        }
                    }
                }
            });
            // 保存修复后的reports对象
            saveReports(fixedReports);
            console.log('修复后的reports:', fixedReports);
        }
        
        // 额外检查：如果fixedReports仍然为空，尝试直接从localStorage重新加载数据
        if (Object.keys(fixedReports).length === 0) {
            console.log('fixedReports为空，尝试直接从localStorage重新加载数据...');
            const rawData = localStorage.getItem('reports');
            console.log('localStorage中的原始数据:', rawData);
            
            // 尝试直接解析原始数据
            try {
                if (rawData) {
                    const parsedData = JSON.parse(rawData);
                    console.log('解析后的原始数据:', parsedData);
                    
                    // 如果解析后的数据是数组，尝试手动构建fixedReports
                    if (Array.isArray(parsedData)) {
                        parsedData.forEach((item, index) => {
                            if (item && typeof item === 'object') {
                                // 检查item是否包含orderId和processId
                                if (item.orderId && item.processId) {
                                    const itemKey = `${item.orderId}_${item.processId}`;
                                    fixedReports[itemKey] = item;
                                    console.log('从原始数组数据中提取数据，生成键:', itemKey);
                                }
                            }
                        });
                    }
                    
                    // 保存修复后的数据
                    if (Object.keys(fixedReports).length > 0) {
                        saveReports(fixedReports);
                        console.log('重新修复后的reports:', fixedReports);
                    }
                }
            } catch (e) {
                console.error('解析原始数据时出错:', e);
            }
        }
        
        const reportData = fixedReports[reportKey];
        console.log('报工记录数据:', reportData);
        
        if (!reportData) {
            // 显示更详细的错误信息
            const keys = Object.keys(fixedReports);
            alert(`未找到报工记录。\n\n报工记录键: ${reportKey}\n\n已存在的报工记录键: ${keys.length > 0 ? keys.join(', ') : '无'}`);
            return;
        }
        
        // 显示弹出卡片
        showReportCard(orderId, processId, reportData);
    } catch (error) {
        console.error('查看报工记录时出错:', error);
        alert('查看报工记录时出错: ' + error.message);
    }
}

// 加载报工数据
function loadReports() {
    const data = localStorage.getItem('reports');
    return data ? JSON.parse(data) : {};
}

// 保存报工数据到localStorage
function saveReports(reports) {
    localStorage.setItem('reports', JSON.stringify(reports));
}

// 显示报工记录弹出卡片
function showReportCard(orderId, processId, reportData) {
    // 获取工序名称
    const processes = [
        { id: 'review', name: '评审' },
        { id: 'preparation', name: '生产准备' },
        { id: 'production', name: '生产' },
        { id: 'inspection', name: '质检' },
        { id: 'packaging', name: '包装' }
    ];
    const process = processes.find(p => p.id === processId);
    const processName = process ? process.name : '未知';
    
    // 设置卡片标题
    document.getElementById('reportCardTitle').textContent = `${processName}报工记录详情`;
    
    // 生成报工记录内容
    let reportHtml = '';
    
    switch (processId) {
        case 'review':
            if (reportData) {
                const review = reportData;
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>评审报工详情</h3>
                        <div class="order-info">
                            <div class="order-info-item">
                                <div class="order-info-label">关联客户</div>
                                <div class="order-info-value">${review.customer || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">客户特别要求</div>
                                <div class="order-info-value">${review.customerRequirements || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">评审主持</div>
                                <div class="order-info-value">${review.reviewHost || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">评审地点</div>
                                <div class="order-info-value">${review.reviewLocation || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">参会人员签到附件</div>
                                <div class="order-info-value">${review.attendanceAttachment ? review.attendanceAttachment.join(', ') : '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">加工工艺指定</div>
                                <div class="order-info-value">${review.processingTechnology ? review.processingTechnology.join(', ') : '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">评审结论</div>
                                <div class="order-info-value">${review.reviewConclusion || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">评审现场照片</div>
                                <div class="order-info-value">${review.reviewPhotos ? review.reviewPhotos.join(', ') : '无'}</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                reportHtml = '<p>未找到报工记录</p>';
            }
            break;
        case 'preparation':
            if (reportData.materialReport || reportData.processCardReport) {
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>生产准备报工详情</h3>
                        ${reportData.materialReport ? `
                            <div class="sub-report-section">
                                <h4>领料点数</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">领取数量</div>
                                        <div class="order-info-value">${reportData.materialReport.quantity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验结果</div>
                                        <div class="order-info-value">${reportData.materialReport.inspectionResult || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">领料人</div>
                                        <div class="order-info-value">${reportData.materialReport.materialTaker || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">领料时间</div>
                                        <div class="order-info-value">${reportData.materialReport.materialTime || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${reportData.processCardReport ? `
                            <div class="sub-report-section" style="margin-top: 20px;">
                                <h4>生产工艺流程卡发放</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">发放人</div>
                                        <div class="order-info-value">${reportData.processCardReport.issuer || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">处理日期</div>
                                        <div class="order-info-value">${reportData.processCardReport.processDate || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                reportHtml = '<p>未找到报工记录</p>';
            }
            break;
        case 'production':
            if (reportData.processReports && Object.keys(reportData.processReports).length > 0) {
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>生产报工详情</h3>
                        ${Object.entries(reportData.processReports).map(([processName, productionReport]) => `
                            <div class="sub-report-section" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                <h4>${processName}</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">数量</div>
                                        <div class="order-info-value">${productionReport.productionQuantity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">报工人</div>
                                        <div class="order-info-value">${productionReport.reporter || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">单件工时</div>
                                        <div class="order-info-value">${productionReport.unitTime || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">提交日期</div>
                                        <div class="order-info-value">${productionReport.submitDate || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">自检结论</div>
                                        <div class="order-info-value">${productionReport.selfInspectionResult || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                reportHtml = '<p>未找到报工记录</p>';
            }
            break;
        case 'inspection':
            if (reportData.inspectionReports) {
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>质检报工详情</h3>
                        ${reportData.inspectionReports.incoming ? `
                            <div class="sub-report-section" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                <h4>来料检</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">供应商名称</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.supplierName || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">PO</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.poNumber || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">材质</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.material || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">来料数量</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.incomingQuantity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">抽检样本数量</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.sampleQuantity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验结论</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.inspectionConclusion || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验人员</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.inspectionPerson || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验日期</div>
                                        <div class="order-info-value">${reportData.inspectionReports.incoming.inspectionDate || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${reportData.inspectionReports.first ? `
                            <div class="sub-report-section" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                <h4>首巡检</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">送检工序</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.inspectedProcess || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">送检人</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.submitter || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">送检机台号</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.machineNumber || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">是否涉及生物城项目</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.isBiologicalCity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">自检报工结论</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.selfInspectionResult || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验员复核结论</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.reviewConclusion || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验人员</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.inspectionPerson || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验日期</div>
                                        <div class="order-info-value">${reportData.inspectionReports.first.inspectionDate || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${reportData.inspectionReports.outgoing ? `
                            <div class="sub-report-section" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                <h4>出货检</h4>
                                <div class="order-info">
                                    <div class="order-info-item">
                                        <div class="order-info-label">是否属于生物城项目</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.outgoingIsBiologicalCity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">物料状态</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.materialStatus || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">批次交检数量</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.batchInspectionQuantity || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">涉及委外表面处理检验</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.outsourcingInspection || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">外观/工序错漏检验</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.appearanceInspection || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">抽样全尺寸样品检验</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.fullSizeInspection || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">其他行业规范或通用规范要求</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.industryStandardInspection || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">最终检验结论</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.finalInspectionConclusion || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验员</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.outgoingInspectionPerson || '无'}</div>
                                    </div>
                                    <div class="order-info-item">
                                        <div class="order-info-label">检验日期</div>
                                        <div class="order-info-value">${reportData.inspectionReports.outgoing.outgoingInspectionDate || '无'}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                reportHtml = '<p>未找到报工记录</p>';
            }
            break;
        case 'packaging':
            if (reportData.packagingReport) {
                const packaging = reportData.packagingReport;
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>包装报工详情</h3>
                        <div class="order-info">
                            <div class="order-info-item">
                                <div class="order-info-label">入库处理人</div>
                                <div class="order-info-value">${packaging.warehouseHandler || '无'}</div>
                            </div>
                            <div class="order-info-item">
                                <div class="order-info-label">入库日期</div>
                                <div class="order-info-value">${packaging.warehouseDate || '无'}</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                reportHtml = '<p>未找到报工记录</p>';
            }
            break;
        default:
            reportHtml = '<p>未找到报工记录</p>';
            break;
    }
    
    // 设置卡片内容
    document.getElementById('reportCardBody').innerHTML = reportHtml;
    
    // 显示弹出卡片
    document.getElementById('reportCardOverlay').style.display = 'flex';
}

// 关闭报工记录弹出卡片
function closeReportCard() {
    document.getElementById('reportCardOverlay').style.display = 'none';
}

// 加载工单详情
function loadWorkOrderDetails() {
    const orderId = localStorage.getItem('currentWorkOrder');
    if (!orderId) {
        alert('未找到工单信息，请从主页进入');
        goBack();
        return;
    }
    
    const workOrders = loadWorkOrders();
    const order = workOrders.find(o => o.orderId === orderId);
    
    if (!order) {
        alert('未找到工单信息');
        goBack();
        return;
    }
    
    // 显示工单信息
    const orderInfo = document.getElementById('orderInfo');
    orderInfo.innerHTML = `
        <div class="order-info-item">
            <div class="order-info-label">工单编号</div>
            <div class="order-info-value">${order.orderId}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">图号</div>
            <div class="order-info-value">${order.drawingNumber}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">物料名称</div>
            <div class="order-info-value">${order.materialName}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">订单数量</div>
            <div class="order-info-value">${order.orderQuantity}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">交期</div>
            <div class="order-info-value">${order.deliveryDate}</div>
        </div>
        <div class="order-info-item">
            <div class="order-info-label">订单类型</div>
            <div class="order-info-value">${order.orderType}</div>
        </div>
        ${order.customerCode ? `
        <div class="order-info-item">
            <div class="order-info-label">客户代码</div>
            <div class="order-info-value">${order.customerCode}</div>
        </div>
        ` : ''}
        ${order.orderNumber ? `
        <div class="order-info-item">
            <div class="order-info-label">订单号</div>
            <div class="order-info-value">${order.orderNumber}</div>
        </div>
        ` : ''}
        ${order.batchNumber ? `
        <div class="order-info-item">
            <div class="order-info-label">批次号</div>
            <div class="order-info-value">${order.batchNumber}</div>
        </div>
        ` : ''}
        ${order.processLeader ? `
        <div class="order-info-item">
            <div class="order-info-label">工艺负责人</div>
            <div class="order-info-value">${order.processLeader}</div>
        </div>
        ` : ''}
        ${order.processRoute && order.processRoute.length > 0 ? `
        <div class="order-info-item">
            <div class="order-info-label">工艺路线</div>
            <div class="order-info-value">${order.processRoute.join(', ')}</div>
        </div>
        ` : ''}
        ${order.reviewPoints ? `
        <div class="order-info-item">
            <div class="order-info-label">工艺评审重点</div>
            <div class="order-info-value">${order.reviewPoints}</div>
        </div>
        ` : ''}
        ${order.attachment && order.attachment.length > 0 ? `
        <div class="order-info-item">
            <div class="order-info-label">附件</div>
            <div class="order-info-value">${order.attachment.join(', ')}</div>
        </div>
        ` : ''}
    `;
    
    // 显示工序完成情况
    const processStatus = document.getElementById('processStatus');
    processStatus.innerHTML = `
        <div class="process-list">
            ${processes.map(process => {
                const status = order.processes?.[process.id] || 'pending';
                let statusText = '待处理';
                if (status === 'completed') {
                    statusText = '已完成';
                } else if (status === 'abnormal') {
                    statusText = '工序异常';
                }
                return `
                    <div class="process-item ${status}">
                        <div class="process-name">${process.name}</div>
                        <div class="process-status status-${status}">${statusText}</div>
                        ${(status === 'completed' || status === 'abnormal') ? `
                            <button class="btn btn-secondary" onclick="viewReportRecord('${order.orderId}', '${process.id}')">
                                查看报工记录
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', loadWorkOrderDetails);