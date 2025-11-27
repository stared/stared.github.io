---
title: "Keras or PyTorch as your first deep learning framework"
date: 2018-06-27
author: Piotr Migdał
source: https://deepsense.ai/keras-or-pytorch/
---

We perform image classification, one of the computer vision tasks deep learning shines at. As training from scratch is unfeasible in most cases (as it is very data hungry), we perform transfer learning using ResNet-50 pre-trained on ImageNet. We get as practical as possible, to show both the conceptual differences and conventions.

## Wait, what's transfer learning? And why ResNet-50?

> In practice, very few people train an entire Convolutional Network from scratch (with random initialization), because it is relatively rare to have a dataset of sufficient size. Instead, it is common to pretrain a ConvNet on a very large dataset (e.g. ImageNet, which contains 1.2 million images with 1000 categories), and then use the ConvNet either as an initialization or a fixed feature extractor for the task of interest. – Andrej Karpathy

Transfer learning is a process of making tiny adjustments to a network trained on a given task to perform another, similar task. In our case we work with the ResNet-50 model trained to classify images from the ImageNet dataset. It is enough to learn a lot of textures and patterns that may be useful in other visual tasks, even as alien as this Alien vs. Predator case. That way, we use much less computing power to achieve much better result.

In our case we do it the simplest way:
- keep the pre-trained convolutional layers (so-called feature extractor), with their weights frozen,
- remove the original dense layers, and replace them with brand-new dense layers we will use for training.

ResNet-50 is a popular model for ImageNet image classification (AlexNet, VGG, GoogLeNet, Inception, Xception are other popular models). It is a 50-layer deep neural network architecture based on residual connections, which are connections that add modifications with each layer, rather than completely changing the signal.

## Let the match begin!

We do our Alien vs. Predator task in seven steps:
1. Prepare the dataset
2. Import dependencies
3. Create data generators
4. Create the network
5. Train the model
6. Save and load the model
7. Make predictions on sample test images

## Data augmentation

Performing changes like shear, zoom, and horizontal flip is called data augmentation. We use it to show a neural network which kinds of transformations don't matter. Or, to put it another way, we train on a potentially infinite dataset by generating new images based on the original dataset. Almost all visual tasks benefit, to varying degrees, from data augmentation for training.

In Keras, you get built-in augmentations and preprocess_input method normalizing images put to ResNet-50, but you have no control over their order. In PyTorch, you have to normalize images manually, but you can arrange augmentations in any way you like.

## Create the network

We load the ResNet-50 from both Keras and PyTorch without any effort. They also offer many other well-known pre-trained architectures.

In Keras we may import only the feature-extracting layers, without loading extraneous data (include_top=False). We then create a model in a functional way, using the base model's inputs and outputs. Then we use model.compile(…) to bake into it the loss function, optimizer and other metrics.

In PyTorch, the model is a Python object. The loss function and optimizers are separate objects. For the optimizer, we need to explicitly pass a list of parameters we want it to update.

In PyTorch, we should explicitly specify what we want to load to the GPU using .to(device) method.

Keras and PyTorch deal with log-loss in a different way. In Keras, a network predicts probabilities (has a built-in softmax function), and its built-in cost functions assume they work with probabilities. In PyTorch we have more freedom, but the preferred way is to return logits.

## Train the model

In Keras, the model.fit_generator performs the training… and that's it! Training in Keras is just that convenient.

PyTorch is on the other pole. Everything is explicit here. You need more lines to construct the basic training, but you can freely change and customize all you want.

The magic commands optimizer.zero_grad(), loss.backward() and optimizer.step() (in this order) do the job. If you know what backpropagation is, you appreciate their elegance.

## Conclusions

Keras is more readable and concise, while PyTorch is more flexible.
