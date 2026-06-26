package com.lowlands.coffee.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource, Environment environment) {
        String locations = environment.getProperty("spring.flyway.locations", "classpath:db/migration");
        return Flyway.configure()
                .dataSource(dataSource)
                .locations(locations.split(","))
                .load();
    }

    @Bean
    public static BeanFactoryPostProcessor flywayJpaDependencyPostProcessor() {
        return new BeanFactoryPostProcessor() {
            @Override
            public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
                if (!beanFactory.containsBeanDefinition("entityManagerFactory")) {
                    return;
                }
                BeanDefinition beanDefinition = beanFactory.getBeanDefinition("entityManagerFactory");
                beanDefinition.setDependsOn("flyway");
            }
        };
    }
}
