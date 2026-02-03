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
    let workOrders = data ? JSON.parse(data) : [];
    
    // 过滤掉显示为undefined的工单，只返回包含必要字段的工单
    workOrders = workOrders.filter(order => {
        return order && 
               order.orderId && 
               order.drawingNumber && 
               order.materialName && 
               order.orderQuantity && 
               order.deliveryDate && 
               order.orderType;
    });
    
    // 如果过滤后没有工单，保存空数组回localStorage
    if (workOrders.length === 0) {
        saveWorkOrders(workOrders);
    }
    
    return workOrders;
}

// 保存工单数据到localStorage
function saveWorkOrders(workOrders) {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
}

// 检查工单是否逾期
function isOverdue(deliveryDate) {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    today.setHours(0, 0, 0, 0);
    delivery.setHours(0, 0, 0, 0);
    return delivery < today;
}

// 渲染工单列表
function renderWorkOrders(workOrders = null) {
    const orders = workOrders || loadWorkOrders();
    const workOrderList = document.getElementById('workOrderList');
    
    if (orders.length === 0) {
        workOrderList.innerHTML = '<p class="empty-message">暂无工单，请先创建工单</p>';
        return;
    }
    
    workOrderList.innerHTML = orders.map(order => {
        const overdue = isOverdue(order.deliveryDate);
        return `
            <div class="work-order-item ${overdue ? 'overdue' : ''}">
                <div class="work-order-header">
                    <h3>工单 ${order.orderId}</h3>
                    <div>
                        <button class="btn btn-primary" onclick="viewWorkOrderDetails('${order.orderId}')">查看详情</button>
                        <button class="btn btn-secondary" onclick="deleteWorkOrder('${order.orderId}')">删除</button>
                    </div>
                </div>
                <div class="work-order-info">
                    <div>图号: ${order.drawingNumber}</div>
                    <div>物料名称: ${order.materialName}</div>
                    <div>订单数量: ${order.orderQuantity}</div>
                    <div>交期: ${order.deliveryDate}</div>
                    <div>订单类型: ${order.orderType}</div>
                    ${order.customerCode ? `<div>客户代码: ${order.customerCode}</div>` : ''}
                    ${order.orderNumber ? `<div>订单号: ${order.orderNumber}</div>` : ''}
                    ${order.batchNumber ? `<div>批次号: ${order.batchNumber}</div>` : ''}
                    ${order.processLeader ? `<div>工艺负责人: ${order.processLeader}</div>` : ''}
                </div>
                ${order.processRoute && order.processRoute.length > 0 ? `
                    <div class="work-order-info">
                        <div>工艺路线: ${order.processRoute.join(', ')}</div>
                    </div>
                ` : ''}
                ${order.reviewPoints ? `<div class="work-order-info"><div>工艺评审重点: ${order.reviewPoints}</div></div>` : ''}
                ${order.attachment && order.attachment.length > 0 ? `
                    <div class="work-order-info">
                        <div>附件: ${order.attachment.join(', ')}</div>
                    </div>
                ` : ''}
                <div class="process-list">
                    ${processes.map(process => {
                        const status = order.processes?.[process.id] || 'pending';
                        return `
                            <div class="process-item ${status}">
                                <div class="process-name">${process.name}</div>
                                <div class="process-status status-${status}">${status === 'completed' ? '已完成' : '待处理'}</div>
                                <div class="process-actions">
                                    <button class="btn btn-secondary" onclick="goToReport('${order.orderId}', '${process.id}')">
                                        报工
                                    </button>
                                    ${status === 'completed' ? `
                                        <button class="btn btn-secondary" onclick="viewReportRecord('${order.orderId}', '${process.id}')">
                                            查看报工记录
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 删除工单
function deleteWorkOrder(orderId) {
    if (confirm('确定要删除这个工单吗？')) {
        const workOrders = loadWorkOrders();
        const updatedOrders = workOrders.filter(order => order.orderId !== orderId);
        saveWorkOrders(updatedOrders);
        renderWorkOrders();
    }
}



// 图片上传预览功能
document.addEventListener('DOMContentLoaded', function() {
    const attachmentInput = document.getElementById('attachment');
    const imagePreview = document.getElementById('imagePreview');
    
    if (attachmentInput && imagePreview) {
        attachmentInput.addEventListener('change', function(e) {
            imagePreview.innerHTML = '';
            const files = e.target.files;
            
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'preview-image';
                            imagePreview.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }
    
    // 页面加载时自动渲染工单列表
    renderWorkOrders();
});

// 处理表单提交
document.getElementById('workOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    // 获取工艺路线多选值
    const processRoutes = [];
    const checkboxes = document.querySelectorAll('input[name="processRoute"]:checked');
    checkboxes.forEach(checkbox => {
        processRoutes.push(checkbox.value);
    });
    
    // 获取图片文件（转换为base64存储）
    const attachmentInput = document.getElementById('attachment');
    const images = [];
    if (attachmentInput.files.length > 0) {
        Array.from(attachmentInput.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                // 这里只是记录文件名，实际项目中可能需要上传到服务器
                images.push(file.name);
            }
        });
    }
    
    // 生成工单编号（使用图号+时间戳）
    const drawingNumber = formData.get('drawingNumber');
    const timestamp = Date.now();
    const orderId = `${drawingNumber}_${timestamp}`;
    
    const newOrder = {
        orderId: orderId,
        drawingNumber: drawingNumber,
        orderQuantity: parseInt(formData.get('orderQuantity')),
        deliveryDate: formData.get('deliveryDate'),
        orderType: formData.get('orderType'),
        materialName: formData.get('materialName'),
        processRoute: processRoutes,
        reviewPoints: formData.get('reviewPoints'),
        customerCode: formData.get('customerCode'),
        orderNumber: formData.get('orderNumber'),
        batchNumber: formData.get('batchNumber'),
        processLeader: formData.get('processLeader'),
        attachment: images,
        processes: {}
    };
    
    // 初始化所有工序为待处理状态
    processes.forEach(process => {
        newOrder.processes[process.id] = 'pending';
    });
    
    // 检查工单编号是否已存在
    const workOrders = loadWorkOrders();
    const existingOrder = workOrders.find(order => order.orderId === newOrder.orderId);
    
    if (existingOrder) {
        alert('工单编号已存在，请使用不同的编号');
        return;
    }
    
    // 添加新工单
    workOrders.push(newOrder);
    saveWorkOrders(workOrders);
    
    // 重置表单
    this.reset();
    document.getElementById('imagePreview').innerHTML = '';
    
    // 重新渲染工单列表
    renderWorkOrders();
    
    // 显示成功消息
    alert('工单创建成功！');
});

// 跳转到报工页面
function goToReport(orderId, processId) {
    // 存储工单和工序信息到localStorage，供报工页面使用
    localStorage.setItem('currentReport', JSON.stringify({ orderId, processId }));
    // 跳转到报工页面
    window.location.href = 'report.html';
}

// 搜索工单
function searchWorkOrders() {
    const batchNumberSearch = document.getElementById('batchNumberSearch').value;
    const drawingNumberSearch = document.getElementById('drawingNumberSearch').value;
    
    const workOrders = loadWorkOrders();
    const filteredOrders = workOrders.filter(order => {
        const matchesBatchNumber = !batchNumberSearch || order.batchNumber === batchNumberSearch;
        const matchesDrawingNumber = !drawingNumberSearch || order.drawingNumber === drawingNumberSearch;
        return matchesBatchNumber && matchesDrawingNumber;
    });
    
    renderWorkOrders(filteredOrders);
}

// 清空搜索
function clearSearch() {
    document.getElementById('batchNumberSearch').value = '';
    document.getElementById('drawingNumberSearch').value = '';
    renderWorkOrders();
}

// 打开工单管理
function openWorkOrderManagement() {
    // 这里可以实现打开工单管理页面的逻辑
    // 由于我们已经在主页显示了所有工单，所以这里只是刷新页面并清空搜索
    clearSearch();
    alert('已打开工单管理视图');
}

// 打开不合格品管理
function openNonconformingManagement() {
    // 跳转到不合格品管理页面
    window.location.href = 'nonconforming.html';
}

// 计算合格率
function calculateQualifiedRate() {
    const reports = loadReports();
    const nonconforming = loadNonconforming();
    
    // 计算总质检次数
    let totalInspections = 0;
    let qualifiedInspections = 0;
    
    // 遍历所有报工数据
    Object.values(reports).forEach(reportData => {
        // 检查是否有质检报工
        if (reportData.inspectionReport) {
            const inspectionReport = reportData.inspectionReport;
            
            // 检查来料检
            if (inspectionReport.incomingInspection) {
                totalInspections++;
                if (inspectionReport.incomingInspection.conclusion === '合格') {
                    qualifiedInspections++;
                }
            }
            
            // 检查首巡检
            if (inspectionReport.firstInspection) {
                totalInspections++;
                if (inspectionReport.firstInspection.conclusion === '合格') {
                    qualifiedInspections++;
                }
            }
            
            // 检查出货检
            if (inspectionReport.outgoingInspection) {
                totalInspections++;
                if (inspectionReport.outgoingInspection.conclusion === '合格') {
                    qualifiedInspections++;
                }
            }
        }
    });
    
    // 如果没有质检数据，返回0%
    if (totalInspections === 0) {
        return 0;
    }
    
    // 计算合格率
    return Math.round((qualifiedInspections / totalInspections) * 100);
}

// 计算交期准时率
function calculateOnTimeRate() {
    const workOrders = loadWorkOrders();
    
    // 如果没有工单，返回0%
    if (workOrders.length === 0) {
        return 0;
    }
    
    // 计算准时完成的工单数量
    const onTimeOrders = workOrders.filter(order => {
        // 检查工单是否已完成
        const isCompleted = Object.values(order.processes || {}).every(status => status === 'completed');
        
        // 检查交期是否逾期
        const isOverdue = new Date(order.deliveryDate) < new Date();
        
        // 如果工单已完成且未逾期，或者工单未逾期（尚未到交期），则视为准时
        return isCompleted ? !isOverdue : !isOverdue;
    });
    
    // 计算交期准时率
    return Math.round((onTimeOrders.length / workOrders.length) * 100);
}

// 计算工单完成率
function calculateCompletionRate() {
    const workOrders = loadWorkOrders();
    
    // 如果没有工单，返回0%
    if (workOrders.length === 0) {
        return 0;
    }
    
    // 计算已完成的工单数量
    const completedOrders = workOrders.filter(order => {
        // 检查所有工序是否都已完成
        return Object.values(order.processes || {}).every(status => status === 'completed');
    });
    
    // 计算工单完成率
    return Math.round((completedOrders.length / workOrders.length) * 100);
}

// 计算待完成工单数量
function calculatePendingOrders() {
    const workOrders = loadWorkOrders();
    
    // 如果没有工单，返回0
    if (workOrders.length === 0) {
        return 0;
    }
    
    // 计算待完成的工单数量
    const pendingOrders = workOrders.filter(order => {
        // 检查是否存在未完成的工序
        return !Object.values(order.processes || {}).every(status => status === 'completed');
    });
    
    // 返回待完成工单数量
    return pendingOrders.length;
}

// 加载报工数据
function loadReports() {
    const data = localStorage.getItem('reports');
    return data ? JSON.parse(data) : {};
}

// 加载不合格品数据
function loadNonconforming() {
    const data = localStorage.getItem('nonconforming');
    return data ? JSON.parse(data) : [];
}

// 渲染统计数据
function renderStats() {
    // 计算统计数据
    const qualifiedRate = calculateQualifiedRate();
    const onTimeRate = calculateOnTimeRate();
    const completionRate = calculateCompletionRate();
    const pendingOrders = calculatePendingOrders();
    
    // 更新页面显示
    document.getElementById('qualifiedRate').textContent = `${qualifiedRate}%`;
    document.getElementById('onTimeRate').textContent = `${onTimeRate}%`;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
}

// 页面加载时渲染统计数据
window.addEventListener('DOMContentLoaded', renderStats);

// 查看工单详情
function viewWorkOrderDetails(orderId) {
    // 存储工单信息到localStorage，供详情页面使用
    localStorage.setItem('currentWorkOrder', orderId);
    // 跳转到工单详情页面
    window.location.href = 'workorder-details.html';
}

// 查看报工记录
// 查看报工记录
function viewReportRecord(orderId, processId) {
    try {
        console.log('查看报工记录:', orderId, processId);
        // 加载报工数据
        const reports = loadReports();
        console.log('所有报工数据:', reports);
        const reportKey = `${orderId}_${processId}`;
        console.log('报工记录键:', reportKey);
        const reportData = reports[reportKey];
        console.log('报工记录数据:', reportData);
        
        if (!reportData) {
            alert('未找到报工记录');
            return;
        }
        
        // 显示弹出卡片
        showReportCard(orderId, processId, reportData);
    } catch (error) {
        console.error('查看报工记录时出错:', error);
        alert('查看报工记录时出错: ' + error.message);
    }
}

// 从localStorage加载报工数据
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
    
    // 根据工序类型生成不同的报工记录内容
    let reportHtml = '';
    
    switch (processId) {
        case 'review':
            if (reportData.reviewHost || reportData.customerRequirements || reportData.reviewHost || reportData.reviewLocation || reportData.processingTechnology || reportData.reviewConclusion) {
                const review = reportData;
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>评审报工详情</h3>
                        <div class="order-info">
                            <div class="order-info-item">
                                <div class="order-info-label">关联客户</div>
                                <div class="order-info-value">${review.customerRequirements || '无'}</div>
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

// 页面加载时渲染工单列表
document.addEventListener('DOMContentLoaded', renderWorkOrders);