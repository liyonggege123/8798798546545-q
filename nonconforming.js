// 从localStorage加载不合格品数据
function loadNonconforming() {
    const data = localStorage.getItem('nonconforming');
    return data ? JSON.parse(data) : [];
}

// 保存不合格品数据到localStorage
function saveNonconforming(nonconforming) {
    localStorage.setItem('nonconforming', JSON.stringify(nonconforming));
}

// 从localStorage加载工单数据
function loadWorkOrders() {
    const data = localStorage.getItem('workOrders');
    return data ? JSON.parse(data) : [];
}

// 保存工单数据到localStorage
function saveWorkOrders(workOrders) {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
}

// 返回主页
function goBack() {
    window.location.href = 'index.html';
}

// 渲染不合格品清单
function renderNonconformingList() {
    const nonconformingData = loadNonconforming();
    const nonconformingList = document.getElementById('nonconformingList');
    
    if (nonconformingData.length === 0) {
        nonconformingList.innerHTML = '<p class="empty-message">暂无不合格品记录</p>';
        return;
    }
    
    // 获取工单信息
    const workOrders = loadWorkOrders();
    const workOrderMap = {};
    workOrders.forEach(order => {
        workOrderMap[order.orderId] = order;
    });
    
    nonconformingList.innerHTML = `
        <table class="nonconforming-table">
            <thead>
                <tr>
                    <th>编号</th>
                    <th>工单编号</th>
                    <th>图号</th>
                    <th>检验类型</th>
                    <th>创建时间</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${nonconformingData.map(item => {
                    const workOrder = workOrderMap[item.orderId];
                    const inspectionTypeText = {
                        'incoming': '来料检',
                        'first': '首巡检',
                        'outgoing': '出货检'
                    }[item.inspectionType] || item.inspectionType;
                    
                    return `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.orderId}</td>
                            <td>${workOrder ? workOrder.drawingNumber : '未知'}</td>
                            <td>${inspectionTypeText}</td>
                            <td>${new Date(item.createdAt).toLocaleString()}</td>
                            <td class="status-${item.status === '待处置' ? 'pending' : 'completed'}">${item.status}</td>
                            <td>
                                <button class="btn btn-secondary" onclick="viewNonconformingDetails('${item.id}')">查看明细</button>
                                <button class="btn btn-primary" onclick="disposeNonconforming('${item.id}')">处置</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// 查看不合格品明细
function viewNonconformingDetails(nonconformingId) {
    const nonconformingData = loadNonconforming();
    const item = nonconformingData.find(item => item.id === nonconformingId);
    
    if (!item) {
        alert('未找到不合格品记录');
        return;
    }
    
    // 获取工单信息
    const workOrders = loadWorkOrders();
    const workOrder = workOrders.find(order => order.orderId === item.orderId);
    
    // 获取检验类型文本
    const inspectionTypeText = {
        'incoming': '来料检',
        'first': '首巡检',
        'outgoing': '出货检'
    }[item.inspectionType] || item.inspectionType;
    
    // 生成不合格品明细HTML
    let detailsHtml = `
        <div class="nonconforming-detail">
            <h3>基本信息</h3>
            <div class="order-info">
                <div class="order-info-item">
                    <div class="order-info-label">编号</div>
                    <div class="order-info-value">${item.id}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">工单编号</div>
                    <div class="order-info-value">${item.orderId}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">图号</div>
                    <div class="order-info-value">${workOrder ? workOrder.drawingNumber : '未知'}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">检验类型</div>
                    <div class="order-info-value">${inspectionTypeText}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">创建时间</div>
                    <div class="order-info-value">${new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div class="order-info-item">
                    <div class="order-info-label">状态</div>
                    <div class="order-info-value">${item.status}</div>
                </div>
            </div>
        </div>
        
        <div class="nonconforming-detail" style="margin-top: 20px;">
            <h3>检验信息</h3>
            <div class="order-info">
    `;
    
    // 根据检验类型添加不同的检验信息
    const reportData = item.reportData;
    if (item.inspectionType === 'incoming') {
        detailsHtml += `
            <div class="order-info-item">
                <div class="order-info-label">供应商名称</div>
                <div class="order-info-value">${reportData.supplierName || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">PO</div>
                <div class="order-info-value">${reportData.poNumber || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">材质</div>
                <div class="order-info-value">${reportData.material || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">来料数量</div>
                <div class="order-info-value">${reportData.incomingQuantity || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">抽检样本数量</div>
                <div class="order-info-value">${reportData.sampleQuantity || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">检验结论</div>
                <div class="order-info-value">${reportData.inspectionConclusion || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">不合格描述</div>
                <div class="order-info-value">${reportData.unqualifiedDescription || '无'}</div>
            </div>
        `;
    } else if (item.inspectionType === 'first') {
        detailsHtml += `
            <div class="order-info-item">
                <div class="order-info-label">送检工序</div>
                <div class="order-info-value">${reportData.inspectedProcess || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">送检人</div>
                <div class="order-info-value">${reportData.submitter || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">送检机台号</div>
                <div class="order-info-value">${reportData.machineNumber || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">是否涉及生物城项目</div>
                <div class="order-info-value">${reportData.isBiologicalCity || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">自检报工结论</div>
                <div class="order-info-value">${reportData.selfInspectionResult || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">检验员复核结论</div>
                <div class="order-info-value">${reportData.reviewConclusion || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">不合格描述</div>
                <div class="order-info-value">${reportData.firstUnqualifiedDescription || '无'}</div>
            </div>
        `;
    } else if (item.inspectionType === 'outgoing') {
        detailsHtml += `
            <div class="order-info-item">
                <div class="order-info-label">是否属于生物城项目</div>
                <div class="order-info-value">${reportData.outgoingIsBiologicalCity || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">物料状态</div>
                <div class="order-info-value">${reportData.materialStatus || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">批次交检数量</div>
                <div class="order-info-value">${reportData.batchInspectionQuantity || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">涉及委外表面处理检验</div>
                <div class="order-info-value">${reportData.outsourcingInspection || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">外观/工序错漏检验</div>
                <div class="order-info-value">${reportData.appearanceInspection || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">抽样全尺寸样品检验</div>
                <div class="order-info-value">${reportData.fullSizeInspection || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">其他行业规范或通用规范要求</div>
                <div class="order-info-value">${reportData.industryStandardInspection || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">最终检验结论</div>
                <div class="order-info-value">${reportData.finalInspectionConclusion || '无'}</div>
            </div>
            <div class="order-info-item">
                <div class="order-info-label">不合格描述</div>
                <div class="order-info-value">${reportData.finalUnqualifiedDescription || '无'}</div>
            </div>
        `;
    }
    
    detailsHtml += `
            </div>
        </div>
    `;
    
    // 如果有处置记录，添加处置信息
    if (item.disposal) {
        detailsHtml += `
            <div class="nonconforming-detail" style="margin-top: 20px;">
                <h3>处置信息</h3>
                <div class="order-info">
                    <div class="order-info-item">
                        <div class="order-info-label">原因分析</div>
                        <div class="order-info-value">${item.disposal.causeAnalysis || '无'}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">纠正措施</div>
                        <div class="order-info-value">${item.disposal.correctiveAction || '无'}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">品质处置判定</div>
                        <div class="order-info-value">${item.disposal.qualityDisposal || '无'}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">工程处置判定</div>
                        <div class="order-info-value">${item.disposal.engineeringDisposal || '无'}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">最终判定</div>
                        <div class="order-info-value">${item.disposal.finalDisposal || '无'}</div>
                    </div>
                    <div class="order-info-item">
                        <div class="order-info-label">是否涉及预防措施</div>
                        <div class="order-info-value">${item.disposal.preventiveAction || '无'}</div>
                    </div>
                    ${item.disposal.preventiveAction === '是' ? `
                        <div class="order-info-item">
                            <div class="order-info-label">预防措施详情</div>
                            <div class="order-info-value">${item.disposal.preventiveActionDetails || '无'}</div>
                        </div>
                    ` : ''}
                    <div class="order-info-item">
                        <div class="order-info-label">异常关闭</div>
                        <div class="order-info-value">${item.disposal.abnormalClosed || '无'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 设置卡片内容
    document.getElementById('nonconformingCardBody').innerHTML = detailsHtml;
    
    // 显示弹出卡片
    document.getElementById('nonconformingCardOverlay').style.display = 'flex';
}

// 关闭不合格品明细弹出卡片
function closeNonconformingCard() {
    document.getElementById('nonconformingCardOverlay').style.display = 'none';
}

// 处置不合格品
function disposeNonconforming(nonconformingId) {
    // 设置不合格品ID
    document.getElementById('nonconformingId').value = nonconformingId;
    
    // 重置表单
    document.getElementById('disposalForm').reset();
    document.getElementById('preventiveActionSection').classList.add('hidden');
    
    // 显示弹出卡片
    document.getElementById('disposalCardOverlay').style.display = 'flex';
}

// 关闭不合格品处置弹出卡片
function closeDisposalCard() {
    document.getElementById('disposalCardOverlay').style.display = 'none';
}

// 切换预防措施详情部分的显示
function togglePreventiveActionSection() {
    const preventiveAction = document.querySelector('input[name="preventiveAction"]:checked').value;
    const section = document.getElementById('preventiveActionSection');
    
    if (preventiveAction === '是') {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

// 提交不合格品处置
function submitDisposal() {
    const nonconformingId = document.getElementById('nonconformingId').value;
    const form = document.getElementById('disposalForm');
    const formData = new FormData(form);
    
    // 收集表单数据
    const disposalData = {};
    for (const [key, value] of formData.entries()) {
        disposalData[key] = value;
    }
    
    // 加载不合格品数据
    const nonconformingData = loadNonconforming();
    const itemIndex = nonconformingData.findIndex(item => item.id === nonconformingId);
    
    if (itemIndex === -1) {
        alert('未找到不合格品记录');
        return;
    }
    
    // 更新不合格品记录
    nonconformingData[itemIndex].status = '已处置';
    nonconformingData[itemIndex].disposal = disposalData;
    nonconformingData[itemIndex].disposedAt = new Date().toISOString();
    
    // 如果异常关闭为是，更新工单工序状态
    if (disposalData.abnormalClosed === '是') {
        const item = nonconformingData[itemIndex];
        const workOrders = loadWorkOrders();
        const orderIndex = workOrders.findIndex(order => order.orderId === item.orderId);
        
        if (orderIndex !== -1) {
            if (!workOrders[orderIndex].processes) {
                workOrders[orderIndex].processes = {};
            }
            workOrders[orderIndex].processes[item.processId] = 'completed';
            saveWorkOrders(workOrders);
        }
    }
    
    // 保存不合格品数据
    saveNonconforming(nonconformingData);
    
    alert('不合格品处置提交成功！');
    closeDisposalCard();
    
    // 重新渲染不合格品清单
    renderNonconformingList();
}

// 添加表单提交事件
document.addEventListener('DOMContentLoaded', function() {
    // 渲染不合格品清单
    renderNonconformingList();
    
    // 添加处置表单提交事件
    const disposalForm = document.getElementById('disposalForm');
    if (disposalForm) {
        disposalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitDisposal();
        });
    }
});