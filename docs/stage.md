<!DOCTYPE html>
<html class="scroll-smooth" lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>PTRM - Training Progress Mountain</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#82C1D6",
                        "background-light": "#F0F9FB",
                        "background-dark": "#0F172A",
                        accent: {
                            yellow: "#F3CC4D",
                            red: "#E57373",
                            green: "#4CAF50",
                            blue: "#2C3E50"
                        }
                    },
                    fontFamily: {
                        display: ["Noto Sans JP", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "12px",
                    },
                },
            },
        };
    </script>
<style type="text/tailwindcss">
        @layer base {
            body { font-family: 'Noto Sans JP', sans-serif; }
        }
        .stage-container {
            @apply relative flex flex-col items-center;
        }
        .stage-row {
            @apply relative w-full flex items-center justify-center min-h-[280px] py-8 px-6;
        }
        .stage-card {
            @apply w-full max-w-2xl relative z-10 p-10 rounded-[40px] transition-all duration-300 border-2 flex flex-col items-center text-center;
        }
        .active-stage {
            @apply bg-white dark:bg-slate-800 border-primary shadow-[0_25px_60px_-15px_rgba(130,193,214,0.4)] scale-105;
        }
        .inactive-stage {
            @apply bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60;
        }
        .mountain-line {
            @apply absolute left-1/2 -translate-x-1/2 w-2 h-full bg-slate-200 dark:bg-slate-800 z-0;
        }
        .mountain-line-active {
            @apply bg-primary/40;
        }
        .trail-dot {
            @apply absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-700 z-20;
        }
        .trail-dot-active {
            @apply bg-primary ring-8 ring-primary/20;
        }
        .trail-dot-completed {
            @apply bg-accent-green;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen">
<header class="sticky top-0 z-50 bg-primary shadow-md">
<div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
<h1 class="text-white text-2xl font-bold tracking-wider">PTRM</h1>
<nav class="hidden md:flex space-x-8">
<a class="text-white hover:text-opacity-80 flex items-center gap-1" href="#"><span class="material-symbols-outlined">home</span>ホーム</a>
<a class="text-white hover:text-opacity-80 flex items-center gap-1" href="#"><span class="material-symbols-outlined">track_changes</span>アクション</a>
<a class="text-white font-bold border-b-2 border-white flex items-center gap-1" href="#"><span class="material-symbols-outlined">terrain</span>ステージ</a>
<a class="text-white hover:text-opacity-80 flex items-center gap-1" href="#"><span class="material-symbols-outlined">person</span>プロフィール</a>
<a class="text-white hover:text-opacity-80 flex items-center gap-1" href="#"><span class="material-symbols-outlined">calendar_today</span>予約</a>
</nav>
<div class="flex items-center gap-4">
<button class="p-2 rounded-full bg-white/20 text-white" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-symbols-outlined">dark_mode</span>
</button>
<div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
<img alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyZ-FJ2vRkyVf97r1ls8nPu5t7qFNoKLZufs07T1LteVx14fLtzrg-_mP-VZFuHhzB7GScyz3nKl4Ps_S0XfvxjaJaY6dNHxvwNaTq643-dqUDqFkFUqWggE9GyVyPxNkwgmNn9aYU8L2ip9uqTwnj6lvJgtiLCjOzNWZQFdyS3eZ4kFoHE4gIBSyx88VUov2DpgD0SitlMsfcH29ivNhb0dyjlDxvuoXjjU19Vm3WvPFgNQCWYmIBgl4wYAQT741I28UXI-eyQ-I"/>
</div>
</div>
</div>
</header>
<main class="max-w-5xl mx-auto px-6 py-10">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
<div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6">
<div class="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-4xl">flag</span>
</div>
<div>
<p class="text-sm text-slate-500 dark:text-slate-400 font-medium">現在のステータス</p>
<h2 class="text-2xl font-bold text-slate-800 dark:text-white">第3合目 到着！</h2>
<p class="text-xs text-primary font-bold mt-1">頂上まであと3ステージ</p>
</div>
</div>
<div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
<div class="flex justify-between items-end mb-4">
<div>
<p class="text-sm font-bold text-accent-yellow">最終目標：体重 60kg</p>
<p class="text-3xl font-black text-slate-800 dark:text-white">現在の差: <span class="text-accent-red">-5.0kg</span></p>
</div>
<div class="text-right">
<p class="text-xs text-slate-500">スタート: 70kg</p>
<p class="text-sm font-bold text-slate-700 dark:text-slate-300">現在: 65.0kg</p>
</div>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
<div class="bg-accent-yellow h-full w-[50%] rounded-full"></div>
</div>
</div>
</div>
<div class="stage-container">
<div class="mountain-line h-full top-0"></div>
<div class="mountain-line mountain-line-active h-[50%] bottom-0"></div>
<div class="stage-row">
<div class="trail-dot -top-4"></div>
<div class="stage-card inactive-stage grayscale">
<div class="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-slate-400 text-4xl">filter_hdr</span>
</div>
<span class="px-4 py-1 bg-slate-200 dark:bg-slate-800 text-xs font-black rounded-full text-slate-500 uppercase tracking-widest mb-3">Stage 6</span>
<h3 class="text-2xl font-bold text-slate-400">山頂：目標達成</h3>
<p class="text-slate-400 mt-2 max-w-md">未知の領域、理想の自分へ到達</p>
</div>
</div>
<div class="stage-row">
<div class="trail-dot -top-4"></div>
<div class="stage-card inactive-stage">
<div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-slate-400 text-4xl">fitness_center</span>
</div>
<span class="px-4 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-black rounded-full text-slate-400 uppercase tracking-widest mb-3">Stage 5</span>
<h3 class="text-2xl font-bold text-slate-600 dark:text-slate-300">第5合目：洗練・専門期</h3>
<p class="text-slate-500 mt-2 max-w-md">より高度なトレーニングと習慣化</p>
</div>
</div>
<div class="stage-row">
<div class="trail-dot -top-4"></div>
<div class="stage-card inactive-stage">
<div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-slate-400 text-4xl">electric_bolt</span>
</div>
<span class="px-4 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-black rounded-full text-slate-400 uppercase tracking-widest mb-3">Stage 4</span>
<h3 class="text-2xl font-bold text-slate-600 dark:text-slate-300">第4合目：加速・強化期</h3>
<p class="text-slate-500 mt-2 max-w-md">代謝が上がり、身体の変化を実感するフェーズ</p>
</div>
</div>
<div class="stage-row">
<div class="trail-dot trail-dot-active -top-4"></div>
<div class="stage-card active-stage">
<div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 mb-6">
<span class="material-symbols-outlined text-white text-5xl">self_improvement</span>
</div>
<div class="mb-2">
<span class="px-6 py-1.5 bg-primary text-xs font-black rounded-full text-white uppercase tracking-[0.2em]">Stage 3 - Current</span>
</div>
<h3 class="text-3xl font-black text-slate-800 dark:text-white mt-2">第3合目：調整・安定期</h3>
<p class="text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-md leading-relaxed">
                    正しいフォームを体に刻み込み、安定したパフォーマンスの土台を築きます。
                </p>
</div>
</div>
<div class="stage-row">
<div class="trail-dot trail-dot-completed -top-4"></div>
<div class="stage-card inactive-stage opacity-90">
<div class="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-accent-green text-4xl">check_circle</span>
</div>
<span class="px-4 py-1 bg-accent-green/10 text-xs font-black rounded-full text-accent-green uppercase tracking-widest mb-3">Stage 2</span>
<h3 class="text-2xl font-bold text-slate-700 dark:text-slate-200">第2合目：導入・基礎期</h3>
<p class="text-slate-500 mt-2 max-w-md">無理のない運動習慣の土台作りを完了しました</p>
</div>
</div>
<div class="stage-row">
<div class="trail-dot trail-dot-completed -top-4"></div>
<div class="stage-card inactive-stage opacity-90">
<div class="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-accent-green text-4xl">check_circle</span>
</div>
<span class="px-4 py-1 bg-accent-green/10 text-xs font-black rounded-full text-accent-green uppercase tracking-widest mb-3">Stage 1</span>
<h3 class="text-2xl font-bold text-slate-700 dark:text-slate-200">第1合目：スタート・準備期</h3>
<p class="text-slate-500 mt-2 max-w-md">最初の一歩。カウンセリングと基本姿勢の習得</p>
</div>
</div>
<div class="stage-row min-h-0 pt-16 pb-32">
<div class="trail-dot -top-4 trail-dot-completed"></div>
<div class="text-center">
<div class="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-300 dark:border-slate-700">
<span class="material-symbols-outlined text-slate-500 text-3xl">home_work</span>
</div>
<p class="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Base Camp</p>
</div>
</div>
</div>
<div class="max-w-md mx-auto mb-20">
<p class="text-slate-400 text-center text-sm font-medium border-t border-slate-200 dark:border-slate-800 pt-8">
            次回のパーソナルセッション: 2025年12月5日 14:00〜
        </p>
</div>
</main>
<div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between z-50">
<a class="flex flex-col items-center gap-1 text-slate-400" href="#">
<span class="material-symbols-outlined">home</span>
<span class="text-[10px]">ホーム</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400" href="#">
<span class="material-symbols-outlined">track_changes</span>
<span class="text-[10px]">アクション</span>
</a>
<a class="flex flex-col items-center gap-1 text-primary" href="#">
<span class="material-symbols-outlined">terrain</span>
<span class="text-[10px] font-bold">ステージ</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400" href="#">
<span class="material-symbols-outlined">person</span>
<span class="text-[10px]">プロフ</span>
</a>
<a class="flex flex-col items-center gap-1 text-slate-400" href="#">
<span class="material-symbols-outlined">calendar_today</span>
<span class="text-[10px]">予約</span>
</a>
</div>

</body></html>