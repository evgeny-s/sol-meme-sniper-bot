import { Telegraf, Markup, Context as TelegrafContext } from 'telegraf';
import {
  InjectBot,
  Start,
  Update,
  Action,
  On,
  Ctx,
  Message,
  Next,
} from 'nestjs-telegraf';
import { Inject, Logger } from '@nestjs/common';
import { UsersService } from '../user';
import { User } from '../user/user.entity';
import { PositionService } from '../position/position.service';

export const NO_ACCESS_MESSAGE =
  'Это бот который показывает уведомления по pump.fun платформе. Похоже что у вас нет подписки или она просрочена. Свяжитесь с @man_s1024 для получения доступа к боту.';

interface Context extends TelegrafContext {
  contextOperation: string;
  contextId: string;
}

@Update()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  public constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PositionService) private readonly positionService: PositionService,
  ) {
    this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Начнём!' },
    ]);
  }

  @Action('menu')
  public async settings(@Ctx() ctx: Context) {
    await ctx.deleteMessage();

    await this.renderList(ctx);
  }

  // TODO: Fix ctx any
  private getUsername(ctx: any) {
    const request = ctx.update.message || ctx.update.callback_query;
    const username = request.from.username;
    if (!username) {
      throw new Error('Username не найден!');
    }
    return username;
  }

  private async getUser(ctx: Context): Promise<User> {
    const user = await this.usersService.findActiveByUsername(
      this.getUsername(ctx),
    );

    if (!user) {
      throw new Error(NO_ACCESS_MESSAGE);
    }

    return user;
  }

  private async renderStart(ctx: Context) {
    const user = await this.getUser(ctx);

    if ([0, '0'].includes(user.chatId) && ctx.chat.id) {
      user.chatId = ctx.chat.id;
      await this.usersService.saveUser(user);
    }

    await ctx.reply(
      `
Привет, я pump.fun бот 🤖. Я анализирую мем коины и буду скидывать уведомления.
      `,
      Markup.inlineKeyboard([Markup.button.callback('✨ Меню ✨', `menu`)]),
    );
  }

  @Start()
  public async startCommand(@Ctx() ctx: Context) {
    await ctx.deleteMessage();

    try {
      await this.renderStart(ctx);
    } catch (e) {
      this.logger.error(`Error rendering start: ${e.message}`);
    }
  }

  @Action('start')
  public async start(@Ctx() ctx: Context) {
    await ctx.deleteMessage();

    try {
      await this.renderStart(ctx);
    } catch (e) {
      this.logger.error(`Error rendering start: ${e.message}`);
    }
  }

  @Action('positions_list')
  public async addItemAction(@Ctx() ctx: Context) {
    await ctx.deleteMessage();

    const positions = await this.positionService.getAll();

    for (const position of positions) {
      await ctx.reply(
        `ID: ${position.id}, Status: ${position.status}, Pool: ${position.raydiumPool} `,
      );
    }
  }

  private async renderList(ctx: Context) {
    return ctx.reply(
      'Меню:',
      Markup.inlineKeyboard(
        [
          Markup.button.callback(
            ' 📋 Вывести список позиций',
            `positions_list`,
          ),
        ],
        {
          columns: 1,
        },
      ),
    );
  }

  @On('text')
  public async getText(
    @Message('text') message: string,
    @Ctx() ctx: any,
    @Next() next,
  ) {
    if (!ctx.session.operationName) {
      next();
      return;
    }

    ctx.session.operationName = '';
    ctx.session.operationId = '';

    await ctx.deleteMessage();

    const user = await this.getUser(ctx);

    next();
  }

  public async sendMessage(
    chatId: number,
    msg: string,
    picture?: string,
  ): Promise<void> {
    if (picture) {
      await this.bot.telegram.sendPhoto(chatId, picture, {
        caption: msg,
        parse_mode: 'Markdown',
      });
    } else {
      await this.bot.telegram.sendMessage(chatId, msg, {
        parse_mode: 'Markdown',
      });
    }

    return Promise.resolve();
  }
}
