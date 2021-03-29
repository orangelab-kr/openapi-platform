import { Database, PATTERN } from '../tools';
import { PlatformModel, WebhookModel } from '@prisma/client';

import Joi from 'joi';

const { prisma } = Database;

export default class Webhook {
  public static async getWebhooks(
    platform: PlatformModel
  ): Promise<WebhookModel> {
    const { platformId } = platform;
    let webhook = await prisma.webhookModel.findFirst({
      where: { platform: { platformId } },
    });

    if (!webhook) {
      webhook = await prisma.webhookModel.create({
        data: { platform: { connect: { platformId } } },
      });
    }

    return webhook;
  }

  public static async setWebhooks(
    platform: PlatformModel,
    props: {
      endRideURL?: string;
      paymentURL?: string;
      refundURL?: string;
    }
  ): Promise<WebhookModel> {
    const schema = Joi.object({
      endRideURL: PATTERN.PLATFORM.WEBHOOK,
      paymentURL: PATTERN.PLATFORM.WEBHOOK,
      refundURL: PATTERN.PLATFORM.WEBHOOK,
    });

    const { platformId } = platform;
    const data = await schema.validateAsync(props);
    const webhook = await prisma.webhookModel.update({
      where: { platformId },
      data,
    });

    return webhook;
  }
}
