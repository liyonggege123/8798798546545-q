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

// 从localStorage加载报工数据
function loadReports() {
    const data = localStorage.getItem('reports');
    return data ? JSON.parse(data) : {};
}

// 返回工单详情页面
function goBack() {
    window.location.href = 'workorder-details.html';
}

// 加载报工记录
function loadReportRecord() {
    const currentReportView = localStorage.getItem('currentReportView');
    if (!currentReportView) {
        alert('未找到报工记录信息，请从工单详情页面进入');
        goBack();
        return;
    }
    
    const { orderId, processId } = JSON.parse(currentReportView);
    const workOrders = loadWorkOrders();
    const order = workOrders.find(o => o.orderId === orderId);
    
    if (!order) {
        alert('未找到工单信息');
        goBack();
        return;
    }
    
    const process = processes.find(p => p.id === processId);
    if (!process) {
        alert('未找到工序信息');
        goBack();
        return;
    }
    
    // 显示工单和工序信息
    const orderProcessInfo = document.getElementById('orderProcessInfo');
    orderProcessInfo.innerHTML = `
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
            <div class="order-info-label">工序</div>
            <div class="order-info-value">${process.name}</div>
        </div>
    `;
    
    // 加载报工数据
    const reports = loadReports();
    const reportKey = `${orderId}_${processId}`;
    const reportData = reports[reportKey] || {};
    
    // 显示报工详情
    const reportDetails = document.getElementById('reportDetails');
    
    if (Object.keys(reportData).length === 0) {
        reportDetails.innerHTML = '<p>未找到报工记录</p>';
        return;
    }
    
    // 根据工序类型显示不同的报工详情
    let reportHtml = '';
    
    switch (processId) {
        case 'review':
            reportHtml = `
                <div class="report-detail-item">
                    <h3>评审报工详情</h3>
                    <div class="order-info">
                        <div class="order-info-item">
                            <div class="order-info-label">关联客户</div>
                            <div class="order-info-value">${reportData.customer || '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">客户特别要求</div>
                            <div class="order-info-value">${reportData.customerRequirements || '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">评审主持</div>
                            <div class="order-info-value">${reportData.reviewHost || '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">评审地点</div>
                            <div class="order-info-value">${reportData.reviewLocation || '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">参会人员签到附件</div>
                            <div class="order-info-value">${reportData.attendanceAttachment ? reportData.attendanceAttachment.join(', ') : '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">加工工艺指定</div>
                            <div class="order-info-value">${reportData.processingTechnology ? reportData.processingTechnology.join(', ') : '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">评审结论</div>
                            <div class="order-info-value">${reportData.reviewConclusion || '无'}</div>
                        </div>
                        <div class="order-info-item">
                            <div class="order-info-label">评审现场照片或证明资料</div>
                            <div class="order-info-value">${reportData.reviewPhotos ? reportData.reviewPhotos.join(', ') : '无'}</div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'preparation':
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
                    <div class="sub-report-section">
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
            break;
        case 'production':
            if (reportData.processReports) {
                let processReportsHtml = '';
                Object.keys(reportData.processReports).forEach(processName => {
                    const processReport = reportData.processReports[processName];
                    processReportsHtml += `
                        <div class="sub-report-section">
                            <h4>${processName}工序</h4>
                            <div class="order-info">
                                <div class="order-info-item">
                                    <div class="order-info-label">数量</div>
                                    <div class="order-info-value">${processReport.productionQuantity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">报工人</div>
                                    <div class="order-info-value">${processReport.reporter || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">单件工时</div>
                                    <div class="order-info-value">${processReport.unitTime || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">提交日期</div>
                                    <div class="order-info-value">${processReport.submitDate || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">自检结论</div>
                                    <div class="order-info-value">${processReport.selfInspectionResult || '无'}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>生产报工详情</h3>
                        ${processReportsHtml}
                    </div>
                `;
            } else {
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>生产报工详情</h3>
                        <p>未找到报工记录</p>
                    </div>
                `;
            }
            break;
        case 'inspection':
            if (reportData.inspectionReports) {
                let inspectionReportsHtml = '';
                
                // 显示来料检
                if (reportData.inspectionReports.incoming) {
                    const incoming = reportData.inspectionReports.incoming;
                    inspectionReportsHtml += `
                        <div class="sub-report-section">
                            <h4>来料检</h4>
                            <div class="order-info">
                                <div class="order-info-item">
                                    <div class="order-info-label">供应商名称</div>
                                    <div class="order-info-value">${incoming.supplierName || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">PO</div>
                                    <div class="order-info-value">${incoming.poNumber || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">材质</div>
                                    <div class="order-info-value">${incoming.material || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">采购单附件</div>
                                    <div class="order-info-value">${incoming.purchaseOrderAttachment ? incoming.purchaseOrderAttachment.join(', ') : '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">实测结果</div>
                                    <div class="order-info-value">${incoming.actualResult || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">来料数量</div>
                                    <div class="order-info-value">${incoming.incomingQuantity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">抽检样本数量</div>
                                    <div class="order-info-value">${incoming.sampleQuantity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">检验结论</div>
                                    <div class="order-info-value">${incoming.inspectionConclusion || '无'}</div>
                                </div>
                                ${incoming.inspectionConclusion === '不合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">不合格描述</div>
                                    <div class="order-info-value">${incoming.unqualifiedDescription || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">不合格证明附件</div>
                                    <div class="order-info-value">${incoming.unqualifiedAttachment ? incoming.unqualifiedAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                ${incoming.inspectionConclusion === '合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">检验标识附件</div>
                                    <div class="order-info-value">${incoming.inspectionMarkAttachment ? incoming.inspectionMarkAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                <div class="order-info-item">
                                    <div class="order-info-label">检验人员</div>
                                    <div class="order-info-value">${incoming.inspectionPerson || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">检验日期</div>
                                    <div class="order-info-value">${incoming.inspectionDate || '无'}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // 显示首巡检
                if (reportData.inspectionReports.first) {
                    const first = reportData.inspectionReports.first;
                    inspectionReportsHtml += `
                        <div class="sub-report-section">
                            <h4>首巡检</h4>
                            <div class="order-info">
                                <div class="order-info-item">
                                    <div class="order-info-label">送检工序</div>
                                    <div class="order-info-value">${first.inspectedProcess || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">送检人</div>
                                    <div class="order-info-value">${first.submitter || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">送检机台号</div>
                                    <div class="order-info-value">${first.machineNumber || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">是否涉及生物城项目</div>
                                    <div class="order-info-value">${first.isBiologicalCity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">自检报工结论</div>
                                    <div class="order-info-value">${first.selfInspectionConclusion || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">检验员复核结论</div>
                                    <div class="order-info-value">${first.reviewConclusion || '无'}</div>
                                </div>
                                ${first.reviewConclusion === '合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">检验报告原档附件</div>
                                    <div class="order-info-value">${first.inspectionReportAttachment ? first.inspectionReportAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                ${first.reviewConclusion === '不合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">不合格描述</div>
                                    <div class="order-info-value">${first.firstUnqualifiedDescription || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">不合格现象附件</div>
                                    <div class="order-info-value">${first.firstUnqualifiedAttachment ? first.firstUnqualifiedAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                <div class="order-info-item">
                                    <div class="order-info-label">检验人员</div>
                                    <div class="order-info-value">${first.firstInspectionPerson || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">检验日期</div>
                                    <div class="order-info-value">${first.firstInspectionDate || '无'}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // 显示出货检
                if (reportData.inspectionReports.outgoing) {
                    const outgoing = reportData.inspectionReports.outgoing;
                    inspectionReportsHtml += `
                        <div class="sub-report-section">
                            <h4>出货检</h4>
                            <div class="order-info">
                                <div class="order-info-item">
                                    <div class="order-info-label">是否属于生物城项目</div>
                                    <div class="order-info-value">${outgoing.outgoingIsBiologicalCity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">物料状态</div>
                                    <div class="order-info-value">${outgoing.materialStatus || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">批次交检数量</div>
                                    <div class="order-info-value">${outgoing.batchInspectionQuantity || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">涉及委外表面处理检验</div>
                                    <div class="order-info-value">${outgoing.outsourcingInspection || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">外观/工序错漏检验</div>
                                    <div class="order-info-value">${outgoing.appearanceInspection || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">抽样全尺寸样品检验</div>
                                    <div class="order-info-value">${outgoing.fullSizeInspection || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">其他行业规范或通用规范要求</div>
                                    <div class="order-info-value">${outgoing.industryStandardInspection || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">最终检验结论</div>
                                    <div class="order-info-value">${outgoing.finalInspectionConclusion || '无'}</div>
                                </div>
                                ${outgoing.finalInspectionConclusion === '合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">成品检验报告附件</div>
                                    <div class="order-info-value">${outgoing.finalReportAttachment ? outgoing.finalReportAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                ${outgoing.finalInspectionConclusion === '不合格' ? `
                                <div class="order-info-item">
                                    <div class="order-info-label">不合格描述</div>
                                    <div class="order-info-value">${outgoing.finalUnqualifiedDescription || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">异常现象附件</div>
                                    <div class="order-info-value">${outgoing.finalUnqualifiedAttachment ? outgoing.finalUnqualifiedAttachment.join(', ') : '无'}</div>
                                </div>
                                ` : ''}
                                <div class="order-info-item">
                                    <div class="order-info-label">检验员</div>
                                    <div class="order-info-value">${outgoing.outgoingInspectionPerson || '无'}</div>
                                </div>
                                <div class="order-info-item">
                                    <div class="order-info-label">检验日期</div>
                                    <div class="order-info-value">${outgoing.outgoingInspectionDate || '无'}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>质检报工详情</h3>
                        ${inspectionReportsHtml}
                    </div>
                `;
            } else {
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>质检报工详情</h3>
                        <p>未找到报工记录</p>
                    </div>
                `;
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
                reportHtml = `
                    <div class="report-detail-item">
                        <h3>包装报工详情</h3>
                        <p>未找到报工记录</p>
                    </div>
                `;
            }
            break;
        default:
            reportHtml = '<p>未找到报工记录</p>';
            break;
    }
    
    reportDetails.innerHTML = reportHtml;
}

// 页面加载时执行
window.addEventListener('DOMContentLoaded', loadReportRecord);