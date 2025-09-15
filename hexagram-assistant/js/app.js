// 爻决助手 - 网页版主应用
class HexagramAssistant {
  constructor() {
    this.currentPage = 'home';
    this.question = '';
    this.selectedCategory = 'general';
    this.isDivining = false;
    this.divinationCount = 0;
    this.hexagrams = [];
    this.hexagramHistory = [];
    this.currentHexagram = null;
    
    this.init();
  }

  async init() {
    console.log('爻决助手网页版启动');
    
    // 初始化数据
    await this.loadHexagrams();
    this.loadDivinationCount();
    this.loadHistory();
    
    // 绑定事件
    this.bindEvents();
    
    // 显示首页
    this.showPage('home');
  }

  // 加载卦象数据
  async loadHexagrams() {
    try {
      const response = await fetch('data/hexagrams.json');
      if (!response.ok) {
        throw new Error('Failed to load hexagrams data');
      }
      const data = await response.json();
      this.hexagrams = data.hexagrams; // <--- 我们现在只取信封里的“信”，也就是那个数组
      console.log(`加载了 ${this.hexagrams.length} 个卦象`);
    } catch (error) {
      console.error('加载卦象数据失败:', error);
      // 使用默认数据作为后备
      this.hexagrams = this.getDefaultHexagrams();
    }
  }

  // 获取默认卦象数据（备用）
  getDefaultHexagrams() {
    return [
      {
        id: 1,
        name: '乾卦',
        symbol: '䷀',
        meaning: '天行健，君子以自强不息',
        keywords: ['刚健', '进取', '领导', '创新'],
        fortune: '吉',
        description: '乾为天，象征刚健中正，事业蒸蒸日上',
        image: 'https://via.placeholder.com/300x300/6B46C1/FFFFFF?text=乾卦',
        interpretation: {
          career: '事业正处于上升期，应把握机会，勇于创新',
          love: '感情需要主动出击，展现自信和魅力',
          study: '学业进步明显，应继续保持努力',
          finance: '财运亨通，投资有利可图',
          relationship: '人际关系和谐，领导力得到认可',
          health: '身体健康，精力充沛',
          general: '整体运势良好，应积极进取'
        }
      },
      {
        id: 2,
        name: '坤卦',
        symbol: '䷁',
        meaning: '地势坤，君子以厚德载物',
        keywords: ['包容', '稳重', '承载', '合作'],
        fortune: '吉',
        description: '坤为地，象征包容承载，适合合作发展',
        image: 'https://via.placeholder.com/300x300/9333ea/FFFFFF?text=坤卦',
        interpretation: {
          career: '适合团队合作，以德服人',
          love: '感情需要包容和理解，建立深厚基础',
          study: '学习应注重基础，循序渐进',
          finance: '投资稳健，长期收益可观',
          relationship: '人际关系和谐，善于倾听',
          health: '注意调养，保持平和心态',
          general: '应以柔克刚，稳中求进'
        }
      }
    ];
  }

  // 加载起卦次数
  loadDivinationCount() {
    const count = localStorage.getItem('divinationCount') || 0;
    this.divinationCount = parseInt(count);
    this.updateDivinationCount();
  }

  // 保存起卦次数
  saveDivinationCount() {
    this.divinationCount++;
    localStorage.setItem('divinationCount', this.divinationCount);
    this.updateDivinationCount();
  }

  // 更新起卦次数显示
  updateDivinationCount() {
    const countElement = document.getElementById('divination-count');
    if (countElement) {
      countElement.textContent = this.divinationCount;
    }
  }

  // 加载历史记录
  loadHistory() {
    const history = localStorage.getItem('hexagramHistory');
    if (history) {
      this.hexagramHistory = JSON.parse(history);
    }
  }

  // 保存历史记录
  saveHistory() {
    localStorage.setItem('hexagramHistory', JSON.stringify(this.hexagramHistory));
  }

  // 绑定事件
  bindEvents() {
    // 问题输入
    const questionInput = document.getElementById('question-input');
    if (questionInput) {
      questionInput.addEventListener('input', (e) => {
        this.question = e.target.value;
        this.updateCharCount();
      });
    }

    // 问题类型选择
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        this.selectCategory(category);
      });
    });

    // 起卦按钮
    const divinationBtn = document.getElementById('start-divination');
    if (divinationBtn) {
      divinationBtn.addEventListener('click', () => {
        this.startDivination();
      });
    }

    // 底部导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.showPage(page);
      });
    });

    // 返回按钮
    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showPage('home');
      });
    }

    // 重新解读按钮
    const regenerateBtn = document.getElementById('regenerate-btn');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        this.regenerateInterpretation();
      });
    }

    // 保存结果按钮
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveResult();
      });
    }

    // 清空历史记录按钮
    const clearHistoryBtn = document.querySelector('.clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        this.clearHistory();
      });
    }

    // 分享按钮
    const shareBtn = document.querySelector('.share-button');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareResult();
      });
    }
  }

  // 更新字符计数
  updateCharCount() {
    const charCount = document.getElementById('char-count');
    if (charCount) {
      charCount.textContent = this.question.length;
    }
  }

  // 选择问题类型
  selectCategory(category) {
    this.selectedCategory = category;
    
    // 更新UI
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
      option.classList.remove('active');
      if (option.dataset.category === category) {
        option.classList.add('active');
      }
    });
  }

  // 开始起卦
  async startDivination() {
    if (!this.question.trim()) {
      this.showToast('请输入您的问题');
      return;
    }

    if (this.isDivining) {
      return;
    }

    this.isDivining = true;
    this.updateDivinationButton(true);

    // 显示加载页面
    this.showPage('loading');

    try {
      // 模拟起卦过程
      await this.delay(2000);

      // 随机选择卦象
      const randomIndex = Math.floor(Math.random() * this.hexagrams.length);
      this.currentHexagram = this.hexagrams[randomIndex];

      // 保存起卦次数
      this.saveDivinationCount();

      // 保存到历史记录
      this.saveToHistory(this.currentHexagram, this.question, this.selectedCategory);

      // 显示结果页面
      this.showResult();
    } catch (error) {
      console.error('起卦失败:', error);
      this.showToast('起卦失败，请重试');
      this.showPage('home');
    } finally {
      this.isDivining = false;
      this.updateDivinationButton(false);
    }
  }

  // 更新起卦按钮状态
  updateDivinationButton(isLoading) {
    const button = document.getElementById('start-divination');
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `
        <div class="loading-animation">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      `;
    } else {
      button.disabled = false;
      button.innerHTML = `
        <span class="button-text">立即起卦</span>
        <span class="button-icon">🔮</span>
      `;
    }
  }

  // 显示结果页面
showResult() {
    if (!this.currentHexagram) return;

    const hexagramNameEl = document.getElementById('hexagram-name');
    const hexagramNumber = document.getElementById('hexagram-number');
    const hexagramImage = document.getElementById('hexagram-image');
    const hexagramSymbol = document.getElementById('hexagram-symbol');
    const hexagramDescription = document.getElementById('hexagram-description');

    // 清理可能残留的旧吉凶标签
    const oldFortuneTag = hexagramNameEl.parentNode.querySelector('.fortune-tag');
    if (oldFortuneTag) oldFortuneTag.remove();

    if (hexagramNameEl) hexagramNameEl.textContent = this.currentHexagram.name;

    // 添加吉凶显示
    if (this.currentHexagram.fortune) {
        const fortuneTag = document.createElement('span');
        fortuneTag.className = `fortune-tag fortune-${this.currentHexagram.fortune.toLowerCase()}`;
        fortuneTag.textContent = this.currentHexagram.fortune;
        hexagramNameEl.parentNode.insertBefore(fortuneTag, hexagramNameEl.nextSibling);
    }

    if (hexagramNumber) hexagramNumber.textContent = `第${this.currentHexagram.id}卦`;
    if (hexagramImage) {
        hexagramImage.innerHTML = `<img src="${this.currentHexagram.image}" alt="${this.currentHexagram.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">`;
    }
    if (hexagramSymbol) hexagramSymbol.textContent = this.currentHexagram.symbol;
    if (hexagramDescription) {
        hexagramDescription.innerHTML = `<p class="hexagram-meaning">${this.currentHexagram.meaning}</p><div class="hexagram-keywords">${this.currentHexagram.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}</div>`;
    }
    this.generateAIInterpretation();
  this.showPage('result');
}
    



async generateAIInterpretation() {
    const interpretationContent = document.getElementById('interpretation-content');
    if (!interpretationContent || !this.currentHexagram) return;
  
    // 1. 显示加载动画
    interpretationContent.innerHTML = '<div class="loading"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
  
    try {
      // 2. 准备发送给后端的数据
      const requestBody = {
        question: this.question,
        hexagram: this.currentHexagram
      };
  
      // 3. 调用后端AI接口
      const response = await fetch('/api/get-ai-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error('AI interpretation service failed.');
      }
  
      // 4. 获取AI返回的解读
      const data = await response.json();
  
      // 5. 用打字机效果显示出来
      this.typewriterEffect(interpretationContent, data.interpretation);
  
    } catch (error) {
      console.error('生成AI解读失败:', error);
      interpretationContent.textContent = 'AI解读生成失败，请稍后重试。';
    }
  }
    

  // 生成个性化解读
  generatePersonalInterpretation(baseInterpretation) {
    const questionLower = this.question.toLowerCase();
    let personalized = baseInterpretation;

    // 根据问题内容添加个性化建议
    if (questionLower.includes('工作') || questionLower.includes('事业') || questionLower.includes('职业')) {
      personalized += '\n\n针对您的工作问题，建议您保持积极进取的态度，把握机会展现自己的能力。';
    } else if (questionLower.includes('感情') || questionLower.includes('爱情') || questionLower.includes('恋爱')) {
      personalized += '\n\n在感情方面，建议您真诚沟通，用心经营关系，相信美好的事物即将到来。';
    } else if (questionLower.includes('学习') || questionLower.includes('考试') || questionLower.includes('教育')) {
      personalized += '\n\n在学业上，建议您保持专注和耐心，循序渐进，相信努力必有回报。';
    } else if (questionLower.includes('财运') || questionLower.includes('投资') || questionLower.includes('金钱')) {
      personalized += '\n\n在财务方面，建议您谨慎理财，理性投资，避免冲动决策。';
    }

    return personalized;
  }

  // 打字机效果
  typewriterEffect(element, text, speed = 50) {
    element.innerHTML = '';
    let i = 0;

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  // 重新解读
  regenerateInterpretation() {
    this.generateAIInterpretation();
  }

  // 保存结果
  saveResult() {
    if (!this.currentHexagram) return;

    // 已经在起卦时保存到历史记录，这里可以添加额外的保存逻辑
    this.showToast('结果已保存');
  }

  // 保存到历史记录
  saveToHistory(hexagram, question, category) {
    const historyItem = {
      id: Date.now(),
      hexagram: hexagram,
      question: question,
      category: category,
      timestamp: new Date().toISOString()
    };

    this.hexagramHistory.unshift(historyItem);

    // 只保留最近20条记录
    if (this.hexagramHistory.length > 20) {
      this.hexagramHistory = this.hexagramHistory.slice(0, 20);
    }

    this.saveHistory();
  }

  // 显示历史记录页面
  showHistoryPage() {
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');

    if (!historyList || !emptyHistory) return;

    if (this.hexagramHistory.length === 0) {
      historyList.style.display = 'none';
      emptyHistory.style.display = 'block';
    } else {
      historyList.style.display = 'block';
      emptyHistory.style.display = 'none';

      // 渲染历史记录
      historyList.innerHTML = this.hexagramHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
          <div class="history-item-header">
            <div class="history-item-title">${item.hexagram.name}</div>
            <div class="history-item-time">${this.formatTime(item.timestamp)}</div>
          </div>
          <div class="history-item-question">${item.question}</div>
          <div class="history-item-hexagram">
            <span class="history-item-hexagram-symbol">${item.hexagram.symbol}</span>
            <span class="history-item-hexagram-name">${item.hexagram.name}</span>
          </div>
        </div>
      `).join('');

      // 绑定历史记录点击事件
      const historyItems = historyList.querySelectorAll('.history-item');
      historyItems.forEach(item => {
        item.addEventListener('click', () => {
          const id = parseInt(item.dataset.id);
          this.viewHistoryItem(id);
        });
      });
    }
  }

  // 查看历史记录项
  viewHistoryItem(id) {
    const item = this.hexagramHistory.find(h => h.id === id);
    if (item) {
      this.currentHexagram = item.hexagram;
      this.question = item.question;
      this.selectedCategory = item.category;
      this.showResult();
    }
  }

  // 清空历史记录
  clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
      this.hexagramHistory = [];
      this.saveHistory();
      this.showHistoryPage();
      this.showToast('历史记录已清空');
    }
  }

  // 分享结果
  shareResult() {
    if (!this.currentHexagram) return;

    const shareText = `我刚刚通过爻决助手得到了${this.currentHexagram.name}的指引：${this.currentHexagram.meaning}`;
    
    if (navigator.share) {
      // 使用Web Share API
      navigator.share({
        title: '爻决助手 - 卦象解读',
        text: shareText,
        url: window.location.href
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast('分享内容已复制到剪贴板');
      }).catch(() => {
        this.showToast('分享失败，请重试');
      });
    }
  }

  // 显示页面
  showPage(pageName) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // 更新导航状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });

    // 页面特定的初始化
    if (pageName === 'history') {
      this.showHistoryPage();
    }

    this.currentPage = pageName;
  }

  // 显示提示消息
  showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // 3秒后移除
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.hexagramAssistant = new HexagramAssistant();
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  .toast {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);
