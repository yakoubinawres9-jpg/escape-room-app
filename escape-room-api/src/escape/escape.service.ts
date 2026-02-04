import { Injectable, HttpException, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';

interface RiddleData {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

@Injectable()
export class EscapeService implements OnModuleInit {
  private openai: OpenAI;

  onModuleInit() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ---------------- NORMALIZE ----------------
  private normalize(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/^(a|the|my)\s+/i, '')
      .replace(/[^\w\s]/g, '');
  }

  // ---------------- LOCAL RIDDLES ----------------
  private riddlePool: Record<string, Record<number, RiddleData[]>> = {
    classic: {
      1: [
        {
          text: 'I follow you everywhere but never touch you. What am I?',
          difficulty: 'easy',
          hint: 'It appears when there’s light, but you can’t grab it.',
        },
        {
          text: 'I have a neck but no head. What am I?',
          difficulty: 'easy',
          hint: 'It holds liquid and is in your kitchen.',
        },
        {
          text: 'What has to be broken before you can use it?',
          difficulty: 'easy',
          hint: 'It’s breakfast-related.',
        },
      ],
      2: [
        {
          text: 'The more of me there is, the less you see. What am I?',
          difficulty: 'medium',
          hint: 'It blocks your vision in a room at night.',
        },
        {
          text: "What has keys but can't open locks?",
          difficulty: 'medium',
          hint: 'It makes music.',
        },
        {
          text: 'What gets wetter the more it dries?',
          difficulty: 'medium',
          hint: 'It dries you after a shower.',
        },
      ],
      3: [
        {
          text: 'I have hands but cannot clap. What am I?',
          difficulty: 'medium',
          hint: 'It shows time.',
        },
        {
          text: "What has a heart that doesn't beat?",
          difficulty: 'hard',
          hint: 'It is edible and green.',
        },
        {
          text: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
          difficulty: 'hard',
          hint: 'It gives light and melts slowly.',
        },
      ],
      4: [
        {
          text: 'I am full of holes but still hold water. What am I?',
          difficulty: 'medium',
          hint: 'You use me in the kitchen to wash dishes.',
        },
        {
          text: 'What can travel around the world while staying in a corner?',
          difficulty: 'medium',
          hint: 'You stick it on an envelope.',
        },
        {
          text: 'I have cities, but no houses. I have mountains, but no trees. What am I?',
          difficulty: 'hard',
          hint: 'You use me to find directions.',
        },
      ],
    },

    science: {
      1: [
        { text: 'I am the center of an atom. What am I?', difficulty: 'easy', hint: 'Protons and neutrons live here.' },
        { text: 'I have gravity but no mass. What am I?', difficulty: 'medium', hint: 'It bends light and pulls everything.' },
      ],
      2: [
        { text: 'I am the fastest thing in the universe. What am I?', difficulty: 'easy', hint: 'Nothing travels faster than me.' },
        { text: 'I can bend light and make stars appear doubled. What am I?', difficulty: 'medium', hint: 'It’s like a cosmic magnifying glass.' },
      ],
      3: [
        { text: 'I am invisible but make the universe expand. What am I?', difficulty: 'hard', hint: 'It’s dark and mysterious.' },
        { text: 'I am essential for life, covering 70% of Earth. What am I?', difficulty: 'easy', hint: 'You drink it every day.' },
      ],
      4: [
        { text: 'I can split atoms but am not alive. What am I?', difficulty: 'hard', hint: 'It powers nuclear reactors.' },
        { text: 'I carry genetic information but am not visible. What am I?', difficulty: 'medium', hint: 'Found in every cell.' },
      ],
    },

    pirate: {
      1: [
        { text: 'I guard treasure but cannot move. What am I?', difficulty: 'easy', hint: 'It holds gold and jewels.' },
        { text: 'I sail but have no wind. What am I?', difficulty: 'easy', hint: 'It floats on water.' },
      ],
      2: [
        { text: 'I hide gold under X. What am I?', difficulty: 'medium', hint: 'Look for the classic map symbol.' },
        { text: 'I follow the map’s directions. What am I?', difficulty: 'medium', hint: 'It points north.' },
      ],
      3: [
        { text: 'I speak in riddles about the sea. What am I?', difficulty: 'hard', hint: 'It’s a talking bird.' },
        { text: 'I sink but float at the same time. What am I?', difficulty: 'hard', hint: 'It’s a vessel for sailors.' },
      ],
      4: [
        { text: 'I am feared by sailors and legend. What am I?', difficulty: 'hard', hint: 'A giant sea monster.' },
        { text: 'I appear in storms and vanish in calm. What am I?', difficulty: 'medium', hint: 'It’s foggy and mysterious.' },
      ],
    },
  };

  // ---------------- ANSWER MAP ----------------
  private RIDDLE_ANSWER_MAP: Record<string, string[]> = {
    'I follow you everywhere but never touch you. What am I?': ['shadow'],
    'I have a neck but no head. What am I?': ['bottle'],
    'What has to be broken before you can use it?': ['egg'],
    'The more of me there is, the less you see. What am I?': ['darkness'],
    "What has keys but can't open locks?": ['piano', 'keyboard'],
    'What gets wetter the more it dries?': ['towel'],
    'I have hands but cannot clap. What am I?': ['clock'],
    "What has a heart that doesn't beat?": ['artichoke'],
    "I'm tall when I'm young, and I'm short when I'm old. What am I?": ['candle'],
    'I am full of holes but still hold water. What am I?': ['sponge'],
    'What can travel around the world while staying in a corner?': ['stamp'],
    'I have cities, but no houses. I have mountains, but no trees. What am I?': ['map'],

    'I am the center of an atom. What am I?': ['nucleus'],
    'I have gravity but no mass. What am I?': ['black hole'],
    'I am the fastest thing in the universe. What am I?': ['light', 'light speed'],
    'I can bend light and make stars appear doubled. What am I?': ['lens', 'gravity lens'],
    'I am invisible but make the universe expand. What am I?': ['dark energy'],
    'I am essential for life, covering 70% of Earth. What am I?': ['water', 'oceans'],
    'I can split atoms but am not alive. What am I?': ['nuclear energy', 'atom'],
    'I carry genetic information but am not visible. What am I?': ['dna', 'genes'],

    'I guard treasure but cannot move. What am I?': ['chest', 'treasure'],
    'I sail but have no wind. What am I?': ['ship', 'boat'],
    'I hide gold under X. What am I?': ['treasure', 'gold'],
    'I follow the map’s directions. What am I?': ['compass', 'map'],
    'I speak in riddles about the sea. What am I?': ['parrot', 'captain'],
    'I sink but float at the same time. What am I?': ['ship', 'boat'],
    'I am feared by sailors and legend. What am I?': ['kraken', 'ghost ship'],
    'I appear in storms and vanish in calm. What am I?': ['fog', 'storm'],
  };

  // ---------------- GET RIDDLE ----------------
  async getRiddle(
    level: number,
    theme: string = 'classic',
    difficulty: string = 'easy'
  ): Promise<{ level: number; riddle: string; difficulty: string; hint: string; isGameOver: boolean }> {
    if (!level || level < 1) level = 1;
    if (level > 4) return { level, riddle: '🎉 YOU ESCAPED!', difficulty, hint: '', isGameOver: true };

    const getLocalRiddle = () => {
      const riddles = this.riddlePool[theme]?.[level] || this.riddlePool['classic'][level];
      const r = riddles[Math.floor(Math.random() * riddles.length)];
      return r;
    };

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Create ONE short ${theme} escape-room riddle. Difficulty: ${difficulty}. Level: ${level}. Do NOT include the answer.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 60,
      });

      const aiRiddle = response.choices[0]?.message?.content?.trim();
      if (!aiRiddle) throw new Error('Empty AI response');

      // Use local hint if AI fallback later
      const hintData = this.RIDDLE_ANSWER_MAP[aiRiddle] ? { hint: 'Use your logic!' } : { hint: 'No hint available' };

      return { level, riddle: aiRiddle, difficulty, hint: hintData.hint, isGameOver: false };
    } catch {
      const localRiddle = getLocalRiddle();
      return { level, riddle: localRiddle.text, difficulty: localRiddle.difficulty, hint: localRiddle.hint, isGameOver: false };
    }
  }

  // ---------------- CHECK ANSWER ----------------
  async checkAnswer(level: number, riddle: string, userAnswer: string) {
    const prompt = `
Riddle: "${riddle}"
User Answer: "${userAnswer}"
Is this correct? Be lenient with "a", "the", or "my".
Respond ONLY with JSON: {"correct": true, "explanation": "short reason"}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');

      const result = JSON.parse(content);
      if (result.correct === true) return { success: true, nextLevel: level + 1 };

      throw new HttpException(result.explanation || '❌ Not correct!', 400);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      // fallback to local answer map
      const normalizedInput = this.normalize(userAnswer);
      const expectedAnswers = this.RIDDLE_ANSWER_MAP[riddle] || [];

      const isCorrect = expectedAnswers.some(ans => normalizedInput === this.normalize(ans));
      if (isCorrect) return { success: true, nextLevel: level + 1 };

      throw new HttpException('❌ AI is offline and answer not in local map!', 400);
    }
  }
  async getHint(riddle: string) {
  for (const theme in this.riddlePool) {
    for (const level in this.riddlePool[theme]) {
      const found = this.riddlePool[theme][level].find(r => r.text === riddle);
      if (found) return found.hint;
    }
  }
  return "No hint available.";
}


}
